// External scene creation function
function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine)

  // Set the background color to light blue
  scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9) // Light blue

  // Create a camera
  const camera = new BABYLON.ArcRotateCamera("Camera", -2.7, 1.6,140, new BABYLON.Vector3(-150, 70, -110), scene)

  camera.fov = 0.647
  //camera.upVector = new BABYLON.Vector3(0, 0, 1)
  //camera.rotation.z = Math.PI / 2
  camera.attachControl(canvas, true)
  camera.upperBetaLimit = Math.PI
  camera.lowerBetaLimit = 0
  camera.lowerAlphaLimit = null
  camera.upperAlphaLimit = null
  camera.inertia = 0.9
  camera.lowerRadiusLimit = 0.2
  camera.upperRadiusLimit = 150
  camera.wheelPrecision = 40

  // Lights setup
  const lightDown = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
  lightDown.intensity = 0.4

  const lightUp = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -1, 1), scene)
  lightUp.intensity = 0.2

  // Directional light for shadows
  const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -2, -1), scene)
  directionalLight.position = new BABYLON.Vector3(5, 10, 5)
  directionalLight.intensity = 0.7

  // Shadow generator
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight)
  shadowGenerator.useBlurExponentialShadowMap = true // Enable soft shadows
  shadowGenerator.blurKernel = 32 // Control shadow softness

  // Create ground plane and grid
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene)
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene)
  groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.8) // Light green
  ground.material = groundMaterial
  ground.receiveShadows = true

  createGrid(scene) // Create grid on the ground

  // Create random trees
  createRandomTrees(scene, shadowGenerator)

  // Create the manual aircraft model
  createAircraft(shadowGenerator)

  // Handle .OBJ file input
  document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0]
    if (file && file.name.endsWith(".obj")) {
      // Modify the following scale and rotation values as needed (values below tailored to business jet)
      const scaleFactor = 0.01 // Example scale factor
      const rotationX = -90 // Rotation in degrees around X-axis
      const rotationY = 90 // Rotation in degrees around Y-axis
      const rotationZ = 180 // Rotation in degrees around Z-axis

      loadObjFile(file, scaleFactor, rotationX, rotationY, rotationZ)
    } else {
      alert("Please select a valid .obj file")
    }
  })


  // Create a red cube for reference
  const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene)
  cube.position = new BABYLON.Vector3(0, 1, 0) // Position above the ground
  const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", scene)
  cubeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0) // Red color
  cube.material = cubeMaterial
  shadowGenerator.addShadowCaster(cube)

  // Create velocity and force vector lines
  createVelocityLine()
  createForceLine()

  // Create GUI overlay
  createGUI()

  return scene
}

// Helper function to create a grid on the ground
function createGrid(scene) {
  const gridLines = []
  const gridSize = 2000
  const step = 10

  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    gridLines.push([new BABYLON.Vector3(i, 0, -gridSize / 2), new BABYLON.Vector3(i, 0, gridSize / 2)])

    gridLines.push([new BABYLON.Vector3(-gridSize / 2, 0, i), new BABYLON.Vector3(gridSize / 2, 0, i)])
  }

  gridLines.forEach(function (linePoints) {
    const gridLine = BABYLON.MeshBuilder.CreateLines("gridLine", { points: linePoints }, scene)
    gridLine.color = new BABYLON.Color3(0.5, 0.5, 0.7) // Dark grey for grid
  })
}

// Helper function to create random trees
function createRandomTrees(scene, shadowGenerator) {
  const treeCount = 50 // Number of trees
  for (let i = 0; i < treeCount; i++) {
    const treeHeight = Math.random() * 4 + 2 // Random height between 2 and 6
    const treeBaseRadius = Math.random() * 1 + 1 // Random radius between 1 and 2

    const tree = BABYLON.MeshBuilder.CreateCylinder(
      "tree",
      {
        diameterTop: 0,
        diameterBottom: treeBaseRadius,
        height: treeHeight,
        tessellation: 8,
      },
      scene
    )

    const xPos = Math.random() * 180 - 90
    const zPos = Math.random() * 180 - 90
    tree.position = new BABYLON.Vector3(xPos, treeHeight / 2, zPos)

    const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene)
    treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13) // Forest green
    tree.material = treeMaterial

    shadowGenerator.addShadowCaster(tree)
  }
}
