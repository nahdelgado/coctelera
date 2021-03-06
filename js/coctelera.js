$(document).bind('deviceready', function() {
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
        restitution: 0.5,
        cof: 0.6
    }));

    // add some circles
    var b;
    for(var i = 0; i < 10; i++) {
      b = Physics.body('rectangle', {
        x: (i*10), // x-coordinate
        y: (i*10), // y-coordinate
        vx: 0.2, // velocity in x-direction
        vy: 0.01, // velocity in y-direction
        width: 40, 
        height: 40,
        styles: {
          fillStyle: colors[ i % 10 ]
        }
      });
      bodies.push(b);
    }
    world.add(bodies);

    world.add( Physics.behavior('body-collision-detection') );
    world.add( Physics.behavior('sweep-prune') );
      
    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('body-impulse-response') );

    // add some gravity
    gravity = Physics.behavior('constant-acceleration');
    // world.add( gravity );

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time, dt ){

        world.step( time );
    });

    // window.addEventListener('deviceorientation', function(eventData) {
    //   // gamma is the left-to-right tilt in degrees, where right is positive
    //   var beta = eventData.gamma,

    //   // beta is the front-to-back tilt in degrees, where front is positive
    //       alpha = eventData.beta,

    //   // alpha is the compass direction the device is facing in degrees
    //       gamma = eventData.alpha;

    //   // deviceorientation does not provide this data
    //   // var motUD = null;

    //   // call our orientation event handler
    //   deviceOrientationHandler(alpha, beta, gamma);
    // }, false);

    function deviceOrientationHandler(alpha, beta, gamma) {
      var alphaR = (alpha - 90) * (Math.PI / 180),
          betaR = beta * (Math.PI / 180),
          gammaR = gamma * (Math.PI / 180),
          sinA = Math.sin(alphaR),
          cosA = Math.cos(alphaR),
          sinB = Math.sin(betaR),
          cosB = Math.cos(betaR),
          sinG = Math.sin(gammaR),
          cosG = Math.cos(gammaR),
          x = 0.0004 * sinG * cosB,
          y = 0.0004 * ((cosG * cosA) + (sinG * sinB * sinA));
          world.getBehaviors()[4].setAcceleration({x: x, y: y});
    }

    var lastX,lastY,lastZ,
        paused = false,
        moveCounter = 0,
        TOLERANCE = 8;
     
    function gotMovement(a) {
      if (paused)
        return;
      paused = true;
      if(!lastX) {
        lastX = a.x;
        lastY = a.y;
        lastZ = a.z;
        paused = false;
        return;
      }
     
      var deltaX = Math.abs(a.x-lastX),
          deltaY = Math.abs(a.y-lastY),
          deltaZ = Math.abs(a.z-lastZ);
     
      if(deltaX + deltaY + deltaZ > TOLERANCE) {
        moveCounter++;
      } else {
        moveCounter = Math.max(0, --moveCounter);
      }
     
      if(deltaX !=0 || deltaY != 0 || deltaZ != 0) console.log(deltaX,deltaY,deltaZ,moveCounter);
     
      if(moveCounter > 1) {
        bodies = world.getBodies();
        for(var i = 0; i < 10; i++) {
          bodies[i].applyForce({x: deltaX, y: deltaY});
        }
        moveCounter=0;
      }
     
      lastX = a.x;
      lastY = a.y;
      lastZ = a.z;

      paused = false;
    }

    function errHandler() {
      console.log("No se pudo obtener la aceleración.");
    }
    // start the ticker
    Physics.util.ticker.start();
    navigator.accelerometer.watchAcceleration(gotMovement, errHandler,{frequency:200});
  });
});