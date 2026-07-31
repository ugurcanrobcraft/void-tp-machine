import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const STORAGE_KEY = "void_tp:machines_data";

function getStoredMachines() {
    const rawData = world.getDynamicProperty(STORAGE_KEY);
    if (!rawData) return [];
    try {
        return JSON.parse(rawData);
    } catch (e) {
        return [];
    }
}

function saveMachines(machines) {
    world.setDynamicProperty(STORAGE_KEY, JSON.stringify(machines));
}

function registerMachine(x, y, z, dimensionId) {
    const machines = getStoredMachines();
    const id = `${dimensionId}_${x}_${y}_${z}`;

    if (!machines.some(m => m.id === id)) {
        machines.push({
            id: id,
            x: x,
            y: y,
            z: z,
            dimension: dimensionId,
            name: `TP Machine [${x}, ${y}, ${z}]`
        });
        saveMachines(machines);
    }
}

function unregisterMachine(x, y, z, dimensionId) {
    let machines = getStoredMachines();
    const id = `${dimensionId}_${x}_${y}_${z}`;
    machines = machines.filter(m => m.id !== id);
    saveMachines(machines);
}

function showTPMenu(player, currentBlockLoc, currentDimensionId) {
    player.playSound("block.amethyst_block.chime", player.location);

    const machines = getStoredMachines();
    const currentId = `${currentDimensionId}_${currentBlockLoc.x}_${currentBlockLoc.y}_${currentBlockLoc.z}`;
    const destinationMachines = machines.filter(m => m.id !== currentId);

    if (destinationMachines.length === 0) {
        const warningForm = new ActionFormData()
            .title("Void TP Machine")
            .body("Başka TP Machine bulunamadı.")
            .button("Kapat");

        system.run(() => {
            warningForm.show(player);
        });
        return;
    }

    const form = new ActionFormData()
        .title("Void TP Machine")
        .body("Teleport olunacak cihazı seç.");

    for (const machine of destinationMachines) {
        form.button(`${machine.name}`);
    }

    system.run(() => {
        form.show(player).then(response => {
            if (response.canceled || response.selection === undefined) return;

            const selectedTarget = destinationMachines[response.selection];
            if (selectedTarget) {
                executeTeleport(player, selectedTarget);
            }
        });
    });
}

function executeTeleport(player, target) {
    try {
        const targetDimension = world.getDimension(target.dimension);
        const targetLocation = { 
            x: target.x + 0.5, 
            y: target.y + 1.0, 
            z: target.z + 0.5 
        };

        player.teleport(targetLocation, { dimension: targetDimension });
        player.playSound("mob.enderman.teleport", targetLocation);

        try {
            targetDimension.spawnParticle("minecraft:portal_reverse_particle", targetLocation);
            targetDimension.spawnParticle("minecraft:mob_portal", targetLocation);
        } catch (particleErr) {}

        player.sendMessage("§aBaşarıyla ışınlandın.");
    } catch (err) {
        player.sendMessage("§cHata: Hedef makineye ışınlanırken bir sorun oluştu.");
    }
}

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("void:tp_machine_component", {
        onPlace(event) {
            const { block } = event;
            registerMachine(block.location.x, block.location.y, block.location.z, block.dimension.id);
        },
        onPlayerDestroy(event) {
            const { block } = event;
            unregisterMachine(block.location.x, block.location.y, block.location.z, block.dimension.id);
        },
        onPlayerInteract(event) {
            const { player, block } = event;
            showTPMenu(player, block.location, block.dimension.id);
        }
    });
}); 
