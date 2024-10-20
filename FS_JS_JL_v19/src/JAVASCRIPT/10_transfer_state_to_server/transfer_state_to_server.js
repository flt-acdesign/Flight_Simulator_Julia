
function sendStateToServer(deltaTime) {
    const aircraftState = {  // state variables, including control inputs, to be sent to Julia server for integration of the equations of motion
        x: aircraft.position.x,
        y: aircraft.position.y,
        z: aircraft.position.z,
        vx: velocity.x,
        vy: velocity.y,
        vz: velocity.z,
        qx: orientation.x,
        qy: orientation.y,
        qz: orientation.z,
        qw: orientation.w,
        wx: angularVelocity.x,
        wy: angularVelocity.y,
        wz: angularVelocity.z,
        fx: forceX,
        fy: forceY,       
        thrust_lever: thrust_lever,
        aileron_input: aileron_input,
        elevator_input: elevator_input,
        rudder_input: rudder_input,
        deltaTime: deltaTime
    };

    fetch("http://localhost:8000/api/update", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: JSON.stringify(aircraftState)  // send to Julia server a string containing a JSON data structure
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                console.error("Error: " + response.status);
            }
        })
        .then(responseText => {
            if (responseText) {  // receive from the server a string containing the new state as a JSON data structure
                const resultString = responseText.trim();
                // Parse the response stringified JSON format
                const responseData = JSON.parse(resultString);

                // Update aircraft's position, velocity, orientation, and angular velocity
                aircraft.position.x = parseFloat(responseData.x);
                aircraft.position.y = parseFloat(responseData.y);
                aircraft.position.z = parseFloat(responseData.z);

                velocity.x = parseFloat(responseData.vx);
                velocity.y = parseFloat(responseData.vy);
                velocity.z = parseFloat(responseData.vz);

                orientation.x = parseFloat(responseData.qx);
                orientation.y = parseFloat(responseData.qy);
                orientation.z = parseFloat(responseData.qz);
                orientation.w = parseFloat(responseData.qw);

                angularVelocity.x = parseFloat(responseData.wx);
                angularVelocity.y = parseFloat(responseData.wy);
                angularVelocity.z = parseFloat(responseData.wz);

                // Update global force values (used for plotting a global force vector)
                forceGlobalX = parseFloat(responseData.fx_global);
                forceGlobalY = parseFloat(responseData.fy_global);
                forceGlobalZ = parseFloat(responseData.fz_global);

                // Update aircraft's rotation based on orientation quaternion
                aircraft.rotationQuaternion = new BABYLON.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w);

                alpha_DEG = parseFloat(responseData.alpha);
                beta_DEG = parseFloat(responseData.beta);

                updateVelocityLine();
                updateForceLine();
                updateTrajectory();
            }
        })
        .catch(error => {
            console.error("Error: " + error);
        });
}