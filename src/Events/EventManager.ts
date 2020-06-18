import { EventEmitter } from "events";
import MidiDeviceManager from "../Midi/MidiDeviceManager";
import MidiMapManager from "../Midi/MidiMapManager";

import Clock from "../Time/Clock";
import TempoTapper from "../Time/TempoTapper";

/**
 * Emits events when a mapped midi message is received
 */
export default class EventManager extends EventEmitter {
    private mainClock : Clock;
    private tempoTapper = new TempoTapper();

    constructor(midiDeviceManager: MidiDeviceManager, midiMapManager: MidiMapManager, mainClock: Clock){
        super();
        this.mainClock = mainClock;

        this.registerTempoListener();
        this.handleMidiMappedEvents(midiDeviceManager, midiMapManager);

    } 
    
    /**
     * Checks incoming MIDI messages, and when it corresponds to a mapping, it handles the mapped event.
     * @param midiDeviceManager 
     * @param midiMapManager 
     */
    handleMidiMappedEvents(midiDeviceManager : MidiDeviceManager, midiMapManager : MidiMapManager){
        midiDeviceManager.on('message', (message) => {
            let event = midiMapManager.getEventMappedToMessage(message);

            if (event) {

                this.emit('event', event)

                if (event.type === 'stage') {
                    this.emit('stageEvent', event)
                } else if (event.type === 'system') {
                    this.emit('systemEvent', event)
                    this.handleSystemEvent(event);
                }
            }
        });
    }
    
    /**
     * Starts the correct action based on the sent system event
     */
    handleSystemEvent(event){
        switch (event.id) {
            case 'MainClock.Start':
                this.mainClock.start();
                break;
            case 'MainClock.Stop':
                this.mainClock.stop();
                break;
            case 'MainClock.Toggle':
                this.mainClock.toggle();
                break;
            case 'MainClock.TapTempo':
                this.tempoTapper.tap();

        }
    }

    /**
     * After tempo is calculated based on system event MainClock.tapTempo, set the main clock to this new tempo
     */
    registerTempoListener() {
        this.tempoTapper.on('tempo', tempo => this.mainClock.setTempo(tempo))
    }
}