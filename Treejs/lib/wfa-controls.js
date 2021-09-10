/**
 * 
 */
//Fra: http://mrdoob.github.com/three.js/examples/misc_controls_pointerlock.html
/* Fungerer fint med følgende <style> (under <head>) i .html fila:
 <style>
body {
	background-color: #ffffff;
	margin: 0;
	overflow: hidden;
	font-family: arial;
}

#blocker {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
}

#instructions {
	width: 100%;
	height: 100%;
	display: -webkit-box;
	display: -moz-box;
	display: box;
	-webkit-box-orient: horizontal;
	-moz-box-orient: horizontal;
	box-orient: horizontal;
	-webkit-box-pack: center;
	-moz-box-pack: center;
	box-pack: center;
	-webkit-box-align: center;
	-moz-box-align: center;
	box-align: center;
	color: #ffffff;
	text-align: center;
	cursor: pointer;
}
</style>
 */
function initLocker() {
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );

	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if ( havePointerLock ) {
		var element = document.body;
		var pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				controls.enabled = true;
				blocker.style.display = 'none';
			} else {
				controls.enabled = false;
				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';
				instructions.style.display = '';
			}
		};

		var pointerlockerror = function ( event ) {
			instructions.style.display = '';
		};

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.addEventListener( 'click', function ( event ) {
			instructions.style.display = 'none';
			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			if ( /Firefox/i.test( navigator.userAgent ) ) {
				var fullscreenchange = function ( event ) {
					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
						element.requestPointerLock();
					}
				};
				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
				element.requestFullscreen();
			} else {
				element.requestPointerLock();
			}
		}, false );
	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}	
}