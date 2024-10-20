// Function to create the aircraft or load an external model
async function createAircraft(shadowGenerator, scene, externalModelUrl = null, rotationParams = { x: 0, y: 0, z: 0 }, scaleParams = { x: 1, y: 1, z: 1 }) {



  // Create the wing using a plane
  const wing = BABYLON.MeshBuilder.CreatePlane("wing", { width: 1.2, height: 8, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene)
  wing.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)   // No rotation needed
  wing.position = new BABYLON.Vector3(0, 0, -1.5)

  // Create the horizontal stabilizer (smaller wing at the back)
  const horizontalStabilizer = BABYLON.MeshBuilder.CreatePlane("horizontalStabilizer", { width: .75, height: 3, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene)
  horizontalStabilizer.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)  // Same plane as wing
  horizontalStabilizer.position = new BABYLON.Vector3(-2.5, 0, -1.5)

  // Create the vertical stabilizer (perpendicular to horizontal stabilizer)
  const verticalStabilizer = BABYLON.MeshBuilder.CreatePlane("verticalStabilizer", { width: 1.2, height: .7, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene)
  verticalStabilizer.rotation = new BABYLON.Vector3(0,  0,Math.PI / 2)  // Rotate to make it vertical
  verticalStabilizer.position = new BABYLON.Vector3(-2.5, .65, -1.5)

  // Create a cylinder to represent the fuselage
  const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", { diameter: 0.5, height: 5, tessellation: 16 }, scene)
  fuselage.rotation = new BABYLON.Vector3(0.0, 0, Math.PI / 2) // Align along Z-axis
  fuselage.position = new BABYLON.Vector3(0, 0, -1.5)

  // Create a parent mesh to represent the aircraft
  aircraft = new BABYLON.TransformNode("aircraft")
  wing.parent = aircraft

  // Parent the stabilizers and fuselage to the aircraft
  horizontalStabilizer.parent = aircraft
  verticalStabilizer.parent = aircraft
  fuselage.parent = aircraft

  // Apply materials
  const aircraftMaterial = new BABYLON.StandardMaterial("aircraftMaterial", scene)
  aircraftMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.2) // Light blue color
  wing.material = aircraftMaterial
  horizontalStabilizer.material = aircraftMaterial
  verticalStabilizer.material = aircraftMaterial
  fuselage.material = aircraftMaterial

  aircraft.position.y = 10 // Start 10 meters above the ground
  //aircraft.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1) // Initialize rotation quaternion
  aircraft.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0)


  // Apply the material to all child meshes of the aircraft
  aircraft.getChildMeshes().forEach((mesh) => {
    mesh.position.z += 1.5 // move the aircraft components forward with respect to the origin
    shadowGenerator.addShadowCaster(mesh)
  })
}




// Function to load the OBJ file using ImportMesh
function loadObjFile(file, scaleFactor, rotationX, rotationY, rotationZ) {
  const reader = new FileReader()
  reader.onload = function (event) {
    const objData = event.target.result
    const blob = new Blob([objData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    BABYLON.SceneLoader.ImportMesh(
      "",
      url,
      "",
      scene,
      function (meshes) {
        // Create a TransformNode to hold all the meshes
        const transformNode = new BABYLON.TransformNode("rootNode", scene)

        // Copy the position, rotation, and scaling from the original aircraft to the transformNode
        if (typeof aircraft !== "undefined") {
          transformNode.position = aircraft.position.clone()
          transformNode.rotation = aircraft.rotation.clone()
          transformNode.scaling = aircraft.scaling.clone()
        }

        // Parent all loaded meshes to the TransformNode
        meshes.forEach(function (mesh) {
          
          // Apply the scale factor to each mesh
          mesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor)

          // Apply the rotations to each mesh
          mesh.rotation.x = BABYLON.Tools.ToRadians(rotationX) // Rotation around X-axis
          mesh.rotation.y = BABYLON.Tools.ToRadians(rotationY) // Rotation around Y-axis
          mesh.rotation.z = BABYLON.Tools.ToRadians(rotationZ) // Rotation around Z-axis
          mesh.position.y += -2
          mesh.position.z += -1
          

          // Parent each mesh to the TransformNode
          mesh.parent = transformNode

          // shadowGenerator.addShadowCaster(mesh)  // should add meshes of the .OBJ to the shadowcaster but does not work, check!
        })

        // Remove the original aircraft object from the scene
        if (typeof aircraft !== "undefined") {
          aircraft.dispose() // Removes the simplified aircraft object from the scene
        }

        // Set the new aircraft as the TransformNode
        aircraft = transformNode
      },
      null,
      null,
      ".obj"
    )
  }

  reader.readAsText(file)
}
