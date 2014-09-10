Physics(function(world){

  var viewWidth = window.innerWidth,
      viewHeight = window.innerHeight,
      viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight),
      bodies =  [],
      colors = [
        '#b58900',
        '#cb4b16',
        '#dc322f',
        '#d33682',
        '#6c71c4',
        '#268bd2',
        '#2aa198',
        '#859900',
        '#dc322f',
        '#b58900'
      ],
      gravity,

      renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: viewWidth,
        height: viewHeight,
        meta: false, // don't display meta data
        styles: {
            // set colors for the circle bodies
            'circle' : {
                strokeStyle: '#351024',
                lineWidth: 1,
                angleIndicator: ''
            }
        }
      });

  // add the renderer
  world.add( renderer );
  // render on each step
  world.on('step', function(){
    world.render();
  });

  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.7,
      cof: 0.4
  }));

  // add some circles
  for(var i = 0; i < 10; i++) {
    b = Physics.body('circle', {
      x: 50, // x-coordinate
      y: 30, // y-coordinate
      vx: 0.2, // velocity in x-direction
      vy: 0.01, // velocity in y-direction
      radius: 20,
      styles: {
        fillStyle: colors[ i % 10 ]
      }
    })
    bodies.push(b);
  }
  world.add(bodies);

  world.add( Physics.behavior('body-collision-detection') );
  world.add( Physics.behavior('sweep-prune') );
    
  // ensure objects bounce when edge collision is detected
  world.add( Physics.behavior('body-impulse-response') );

  // add some gravity
  gravity = Physics.behavior('constant-acceleration');
  world.add( gravity );

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){

      world.step( time );
  });

  // start the ticker
  Physics.util.ticker.start();

  window.addEventListener('deviceorientation', function(eventData) {
    // gamma is the left-to-right tilt in degrees, where right is positive
    // var tiltLR = eventData.gamma;

    // beta is the front-to-back tilt in degrees, where front is positive
    // var tiltFB = eventData.beta;

    // alpha is the compass direction the device is facing in degrees
    var dir = eventData.alpha

    // deviceorientation does not provide this data
    // var motUD = null;

    // call our orientation event handler
    deviceOrientationHandler(dir);
  }, false);

  function deviceOrientationHandler(dir) {
    var rad = dir * (Math.PI / 180),
        cosT = Math.cos(rad),
        sinT = Math.sin(rad),
        x = -0.0004 * sinT,
        y = 0.0004 * cosT;
        world.getBehaviors()[4].setAcceleration({x: x, y: y});
  }

  var lastX,lastY,lastZ,
      paused,
      moveCounter = 0;

  function clearPause() {
    paused = false;
  }
   
  function gotMovement(a) {
    paused = true;
    window.setTimeout(clearPause, 2000);
    if(!lastX) {
      lastX = a.x;
      lastY = a.y;
      lastZ = a.z;
      return;
    }
   
    var deltaX, deltaY, deltaZ;
    deltaX = Math.abs(a.x-lastX);
    deltaY = Math.abs(a.y-lastY);
    deltaZ = Math.abs(a.z-lastZ);
   
    if(deltaX + deltaY + deltaZ > 3) {
      moveCounter++;
    } else {
      moveCounter = Math.max(0, --moveCounter);
    }
   
    if(deltaX !=0 || deltaY != 0 || deltaZ != 0) console.log(deltaX,deltaY,deltaZ,moveCounter);
   
    if(moveCounter > 1) {
      $('#viewport').html("Se movió!\n"deltaX+"\n"+deltaY+"\n"+deltaZ+"\n");
      moveCounter=0;
    }
   
    lastX = a.x;
    lastY = a.y;
    lastZ = a.z;
  }
  navigator.accelerometer.watchAcceleration(gotMovement, errHandler,{frequency:200});
});