import { Engine } from "noa-engine";
import "./utils/state.min.js";
import { config } from "./config/config";
import { water, blocks } from "./config/urls";
import getVoxelID from "./utils/getVoxel-id";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import "@babylonjs/core/Meshes/Builders/boxBuilder";
import gameBuild from "./ui/game-build.js";

const noa = new Engine(config);

noa.camera.zoomDistance = 10;

// init texture for the map
noa.registry.registerMaterial("dirt", null, water);
noa.registry.registerMaterial("grass", null, blocks);

// save texture inside register Block
const waterID = noa.registry.registerBlock(1, { material: "dirt" });
const blocksID = noa.registry.registerBlock(2, { material: "grass" });

noa.world.on("worldDataNeeded", function (id, data, x, y, z) {
  for (var i = 0; i < data.shape[0]; i++) {
    for (var j = 0; j < data.shape[1]; j++) {
      for (var k = 0; k < data.shape[2]; k++) {
        var voxelID = getVoxelID(x + i, y + j, z + k, { blocksID, waterID });
        data.set(i, j, k, voxelID);
      }
    }
  }
  noa.world.setChunkData(id, data);
});

// making player entities
const player = noa.playerEntity;

// render the scece
const scene = noa.rendering.getScene();

const mesh = Mesh.CreateBox("player-mesh", 1, scene);

noa.entities.addComponent(player, noa.entities.names.mesh, {
  mesh: mesh,
  offset: [0, 0.5, 0],
});

// event handlers
const waterEvent = document.querySelector(".game_build-water");
const blocksEvent = document.querySelector(".game_build-blocks");
const pauseEvent = document.querySelector(".game_build-pause");

waterEvent.addEventListener("click", () => {
  noa.inputs.down.on("fire", () => {
    // fire === right mouse click
    if (noa.targetedBlock) {
      // get block positon view
      const pos = noa.targetedBlock.adjacent;
      noa.setBlock(waterID, pos[0], pos[1], pos[2]);
    }
  });
});
blocksEvent.addEventListener("click", () => {
  noa.inputs.down.on("fire", () => {
    // fire === right mouse click
    if (noa.targetedBlock) {
      // get block positon view
      const pos = noa.targetedBlock.adjacent;

      noa.setBlock(blocksID, pos[0], pos[1], pos[2]);
    }
  });
});

// pause event
let paused = false;
pauseEvent.addEventListener("click", () => {
  paused = !paused;
  noa.setPaused(paused);
});

// click left event
noa.inputs.down.on("alt-fire", () => {
  // alt fire === left mouse click
  if (noa.targetedBlock) {
    // get block positon view
    var pos = noa.targetedBlock.position;
    noa.setBlock(0, pos[0], pos[1], pos[2]);
  }
});

gameBuild();
