import * as commandFactory from '@/classes/Commands/CommandFactory';
import * as update from '@/services/FeatureModel/update.service.js';
import { getColorsFromService } from '@/services/FeatureModel/colorsFromService.service';
import { ReloadCommand } from '@/classes/Commands/ReloadCommand';
import { useAppStore } from '@/store/app';

export class CommandManager {
    constructor() {
        this.historyCommands = [];
        this.futureCommands = [];
        this.collaborationManager = null;
        this.type = null;
        this.remoteCommands = null;
        this.commandEvent = null;
        this.d3Data = null;
    }

    executeReload() {
        this.fadeOut(this.d3Data, new ReloadCommand());
    }

    execute(command, initiator = true) {
        if (initiator && this.collaborationManager) {
            this.collaborationManager.send(this.type, 'execute', command.createDTO());
        }

        // Execute current command and push it on stack.
        command.execute();

        // Mark last change
        if (this.historyCommands.length) {
            this.historyCommands.at(-1).unmarkChanges();
        }
        command.markChanges();

        this.historyCommands.push(command);

        // Reset stack of future commands because a new command was already executed.
        this.futureCommands = [];

        this.commandEvent();

        this.fadeOut(this.d3Data, command);
    }

    undo(initiator = true) {
        if (this.historyCommands.length) {
            if (initiator && this.collaborationManager) {
                this.collaborationManager.send(this.type, 'undo');
            }

            // Remove last command from stack and undo it.
            const undoCommand = this.historyCommands.pop();
            undoCommand.undo();

            // Mark last change
            undoCommand.unmarkChanges();
            if (this.historyCommands.length) {
                this.historyCommands.at(-1).markChanges();
            }

            // After that push it to stack that only holds redo-commands.
            this.futureCommands.push(undoCommand);

            this.commandEvent();

            this.fadeOut(this.d3Data, undoCommand);
        }
    }

    redo(initiator = true) {
        if (this.futureCommands.length) {
            if (initiator && this.collaborationManager) {
                this.collaborationManager.send(this.type, 'redo');
            }

            // Remove last command from stack and execute it once again.
            const redoCommand = this.futureCommands.pop();
            redoCommand.execute();

            // Mark last change
            if (this.historyCommands.length) {
                this.historyCommands.at(-1).unmarkChanges();
            }
            redoCommand.markChanges();

            // After that push it to stack that only holds undo-commands.
            this.historyCommands.push(redoCommand);

            this.commandEvent();

            this.fadeOut(this.d3Data, redoCommand);
        }
    }

    isUndoAvailable() {
        return this.historyCommands.length >= 1;
    }

    isRedoAvailable() {
        return this.futureCommands.length >= 1;
    }

    executeRemoteCommands(rootNode, constraints) {
        if (this.remoteCommands) {
            this.remoteCommands.historyCommands.forEach(commandData => {
                const command = commandFactory.create(rootNode, constraints, commandData.type, commandData.data, this.collaborationManager.featureModel);
                this.execute(command, false);
            });

            this.remoteCommands.futureCommands.forEach(commandData => {
                const command = commandFactory.create(rootNode, constraints, commandData.type, commandData.data, this.collaborationManager.featureModel);
                this.execute(command, false);
            });

            this.remoteCommands.futureCommands.forEach(() => this.undo(false));
        }
    }

    async fadeOut(d3Data, command) {
        if (this.type === "constraint"){
            d3Data = this.collaborationManager.featureModelCommandManager.d3Data;
        }
        let done = await getColorsFromService(this.collaborationManager.featureModel.data);
        if (done) {
            await new Promise(r => setTimeout(r, 500));
        } else {
            const appStore = useAppStore();
            appStore.updateSnackbar(
                'Could not detect any special cases, because Service is down.',
                'error',
                3000,
                true);
        }
        // Rerender for edits and fade them out
        command.unmarkChanges();
        update.updateSvg(d3Data);
    }
}
