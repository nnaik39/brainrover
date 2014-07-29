// The controls variable determines how the user navigates the model.
// The tween variable moves the camera's position automatically.

//TODO:
// Fix ugly text sprite labels
// Draw up mocks of CSS plans
// Fix highlights bug

var tween;
var controls;

// The theDiv variable helps set the fullscreen function to the size of the screen.
// The collada variable render the model using the scene tool.
var theDiv;
var collada;

// The camera sets the size of the scene and grid on the page.
// The scene is shorthand for THREE.scene(), and is like a blank canvas that you add objects to.
// The renderer helps incorporate WebGL on the page.
var camera, scene, renderer;

// The particleLight creates the sphere shape for the floating balls around the collada.
// The pointLight creates a light source around the particleLight so it lights up the collada.

var particleLight, pointLight;
var particleLight2, pointLight2;

// The dae refers to the model, and helps scale, set the color, and call specific children of the model.
// Skin is an undefined variable which is used for a forever true if-statement in the animate() function.
var dae, skin;

// The x, y and z variables determine the model's position.
// Thefonstsize refers to the standard font size of the text sprites.
var x = 0;
var y = 0;
var z = 0;
var thefontsize = 30;

// Create a loader
var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = false;

// This loads the brain model, initializes all the functions, and hides the spinner.
loader.load( './models/collada/brainmodel/NewBrain.dae', function ( c ) {
    collada = c;
    initialize();
    init();
    labels();
    animate();
    $('#myspinner').hide();
} );

// depth = the number of 0s after the child name
// This calls a certain child and sets the material of the child to one with RGB values r, g, and b.
// This function is broken
function highlight(child, r, g, b, depth) {
    if (depth == 2) {
        dae.children[0].children[0].children[child].children[0].children[0].material.color.setRGB(r,g,b);
        dae.children[0].children[0].children[child].children[0].children[0].material.ambient.setRGB(r,g,b);
    }
    else {
        dae.children[0].children[0].children[child].children.material.color.setRGB(r,g,b);
        dae.children[0].children[0].children[child].children[0].material.ambient.setRGB(r,g,b);
    }
}

// This initializes the scene, camera, controls, grids, and lights.
function initialize() {
    initializeScene();
    initializeCamera();
    initializeControls();
    initializeGrid();
    initializeLight();
};

// This creates the scene, scales the model, and adds the model to the scene.
function initializeScene() {
    dae = collada.scene;
    dae.scale.x = dae.scale.y = 1;
    dae.scale.z = 1;
    dae.updateMatrix();
    dae.position.x = x;
    dae.position.y = y;
    dae.position.z = z;

    scene = new THREE.Scene();
    scene.add( dae );
};

// This creates the camera, and sets its position.
function initializeCamera() {
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 10, 2, 3 );
}

// This assigns OrbitControls to the camera, which allows the user to click on the model
// and move the camera position.
function initializeControls() {
    controls = new THREE.OrbitControls( camera );
}

// This creates the size and geometry of the grid, and pushes all the vertices
// and makes them equidistant from each other.
function initializeGrid() {
    var size = 14, step = 1;
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( { color: 0x303030 } );

    for ( var i = - size; i <= size; i += step ) {
            geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) );
            geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) );

            geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) );
            geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) );
    }

    var line = new THREE.Line( geometry, material, THREE.LinePieces );
    scene.add( line );
};

// This sets and colors the material for the model and particleLights.
// It also controls the automated spinning of the particleLights, and points a light where the particleLight goes.
// In addition, it initializes and sets the material for the renderer.

function initializeLight() {
    var setMaterial = function( node ) {
        node.material = new THREE.MeshPhongMaterial({color: 0x9999dd} );
        if (node.children) {
            for (var i=0, thelength=node.children.length; i < thelength ; i++ ) {
                setMaterial(node.children[i]);
            }
        }
    }

    particleLight = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 4, 4 ), new THREE.MeshBasicMaterial( { color: 0x00ffdd } ) );
    scene.add( particleLight );
    particleLight2 = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 4, 4 ), new THREE.MeshBasicMaterial( { color: 0xff00dd } ) );
    scene.add( particleLight2 );

    
    scene.add( new THREE.AmbientLight( 0x666666 ) );

    var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
    directionalLight.position.x = Math.random()*2 - 0.5;
    directionalLight.position.y = Math.random()*2 - 0.5;
    directionalLight.position.z = Math.random()*2 - 0.5;
    directionalLight.position.normalize();
    scene.add( directionalLight );

    pointLight = new THREE.PointLight( 0x00ffdd, 1 );
    pointLight.position = particleLight.position;
    scene.add( pointLight );

    pointLight2 = new THREE.PointLight( 0xff00dd, 1 );
    pointLight2.position = particleLight2.position;
    scene.add( pointLight2 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 1);
    $('#content').append(renderer.domElement);
    setMaterial(dae);
}

//labels for the different parts and sets the color
function labels() {  
	var firebase = new Firebase("https://rover.firebaseio.com");
	
	firebase.child("highlights").once('value', function(data) {
		if (data.val() != null) { 
		$.each(data.val(), function(index, value) {
			console.log(index);
			console.log(value);
			highlight(value.child, value.r, value.g, value.b, value.child_depth);
							
		});
		}
	});
	
	firebase.child("sprites").once('value', function(data) {
		if (data.val() != null) {
		$.each(data.val(), function(name, value) {
			var sprite = makeTextSprite(name, {
				fontsize: thefontsize,
				fontface: "Georgia",
				borderColor: {
					r: value.r, 
			                g: value.g, 
			                b: value.b, 
			                a: value.a	
				}
			});
		
			sprite.position.set(value.x, value.y, value.z || 0);
			scene.add(sprite);
		});	
	}
	});
	
}
// middle brain: dae.children[0].children[0].children[4].children[0].material.color.setRGB(1,0,1)
// cerebellum: dae.children[0].children[0].children[3].children[0].children[0].material.color.setRGB(1,1,1)
// pituitary: dae.children[0].children[0].children[2].children[0].material.color.setRGB(1,1,1) 
// left temporal lobe: dae.children[0].children[0].children[11].children[0].material.color.setRGB(1,0,1)
// right temporal lobe: dae.children[0].children[0].children[12].children[0].material.color.setRGB(1,0,1)
// left occipital lobe: dae.children[0].children[0].children[14].children[0].material.color.setRGB(1,0,1)
// right occipital lobe: dae.children[0].children[0].children[13].children[0].material.color.setRGB(1,0,1)
// left frontal lobe:  dae.children[0].children[0].children[8].children[0].children[0].material.color.setRGB(1,1,1)
// right frontal lobe: dae.children[0].children[0].children[7].children[0].children[0].material.color.setRGB(1,1,1)
// left parietal lobe: dae.children[0].children[0].children[9].children[0].children[0].material.color.setRGB(1,1,1)
// right parietal lobe: dae.children[0].children[0].children[10].children[0].children[0].material.color.setRGB(1,1,1)
//                                setMaterial(dae, new THREE.MeshBasicMaterial({color: 0xff0000}));

//////////////////////////////
// This removes the spinner, and removes a Bootstrap class.
//This also listens for the keyDown and windowResize events and declares them false.
function init() {
$( ".spinner" ).remove();
$( "#header" ).removeClass( "col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-lg-6 col-lg-offset-3" ).addClass( "col-md-12" );
document.addEventListener( 'keydown', onDocumentKeyDown, false);
window.addEventListener( 'resize', onWindowResize, false );
}


//This creates the TextSprite.
function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 100;
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 1;
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    var spriteAlignment = THREE.SpriteAlignment.topLeft;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                          + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                          + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
    { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
    var sprite = new THREE.Sprite( spriteMaterial );

    sprite.scale.set(2.5,1.25,1.0);
    // was     sprite.scale.set(100,50,1.0);

    return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.lineTo(x+w-r, y);
	ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	ctx.lineTo(x+w, y+h-r);
	ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	ctx.lineTo(x+r, y+h);
	ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	ctx.lineTo(x, y+r);
	ctx.quadraticCurveTo(x, y, x+r, y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();   
}


//If the user resizes the window, the website will scale to fit within the window.
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setSize( $("#content").width(), $("#content").height());

}

// IF an arrow key is pressed down, then the model will move left or right.
// The scene will go fullscreen if key 68 (a button on the page) is pressed.

function onDocumentKeyDown(event) 
{
    switch ( event.keyCode) 
    {
            case 65: x -= 0.1; break ; //left
            case 83: z -= 0.1; break ; //right
             case 68:

              if( THREEx.FullScreen.activated() ){
                THREEx.FullScreen.cancel();
              }else{
                THREEx.FullScreen.request(theDiv);
              }; break ; //right

} 
}
//This sets the scene to fill the screen.
function fullscreen(){

              if( THREEx.FullScreen.activated() ){
                THREEx.FullScreen.cancel();
              }else{
                THREEx.FullScreen.request(theDiv);
              }; 
}


var t = 0;
var clock = new THREE.Clock();

// This animates the model, causing it to react in realtime.

function animate() {

    var delta = clock.getDelta();


    requestAnimationFrame( animate );

    if ( t > 1 ) t = 0;

    if ( skin ) {

            // guess this can be done smarter...

            // (Indeed, there are way more frames than needed and interpolation is not used at all
            //  could be something like - one morph per each skinning pose keyframe, or even less,
            //  animation could be resampled, morphing interpolation handles sparse keyframes quite well.
            //  Simple animation cycles like this look ok with 10-15 frames instead of 100 ;)

            for ( var i = 0; i < skin.morphTargetInfluences.length; i++ ) {

                    skin.morphTargetInfluences[ i ] = 0;

            }

            skin.morphTargetInfluences[ Math.floor( t * 30 ) ] = 1;

            t += delta;

    }

    controls.update();
    render();

}

//This times the revolutions of the particleLights.
function render() {
    var timer = Date.now() * 0.0004;
    particleLight.position.x = Math.sin( timer * 5 ) * 4;
    particleLight.position.y = Math.cos( timer * 3 ) * 4;
    particleLight.position.z = Math.cos( timer * 5 ) * 4;
    particleLight2.position.x = - Math.sin( timer * 5 ) * 4;
    particleLight2.position.y = -Math.cos( timer * 3 ) * 4;
    particleLight2.position.z = Math.cos( timer * 5 ) * 4;
    renderer.render( scene, camera );

    //moved this code to initialization

}
