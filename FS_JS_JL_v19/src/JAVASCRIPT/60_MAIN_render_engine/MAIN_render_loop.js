
window.addEventListener("DOMContentLoaded", function () {
  
  // Initialize Babylon.js engine
  const canvas = document.getElementById("renderCanvas")
  const engine = new BABYLON.Engine(canvas, true)

  // Call the external scene generation function
  const scene = createScene(engine, canvas)



  // Render loop
  engine.runRenderLoop(function () {
    if (!isPaused && !simulationEnded) {
      let currentTime = Date.now()
      let deltaTime = (currentTime - lastFrameTime) / 1000 // Time in seconds

      lastFrameTime = currentTime
      timeSinceLastUpdate += deltaTime

      // Process updates in steps of 0.05 seconds
      while (timeSinceLastUpdate >= global_deltaTime) {
        timeSinceLastUpdate -= global_deltaTime
        elapsedTime += global_deltaTime

        if (elapsedTime >= 100) {
          simulationEnded = true
          console.log("Simulation ended after 100 seconds.")
          return
        }
        
        updateForcesFromJoystickOrKeyboard() // Update forces and moments based on joystick input
        
        if (aircraft !== undefined) { sendStateToServer(global_deltaTime) } // Send the state to the Julia server for update with the equations of motion and the control input values
      } // end while loop
    } // send state to server for update
   
    if (aircraft !== undefined) { updateInfo() }  // after the update of the state, update displayed coordinates and speed in the GUI as numerical values

    scene.render()  // after the update of the state, render the aircraft

  }) // end render loop funtion

  // Resize the engine on resize
  window.addEventListener("resize", function () { engine.resize() })

  // Gamepad event listeners
  window.addEventListener("gamepadconnected", (event) => {
    gamepadIndex = event.gamepad.index
    console.log(`Gamepad connected at index ${gamepadIndex}: ${event.gamepad.id}.`)
  })

  window.addEventListener("gamepaddisconnected", () => {
    console.log("Gamepad disconnected.")
    gamepadIndex = null
  })
})
