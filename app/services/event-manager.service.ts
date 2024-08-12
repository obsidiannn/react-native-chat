import { IModel } from "@repo/enums";
import { IEvent } from "@repo/types";

class EventEmitter {
	private events: { [key: string]: any };

	constructor() {
		this.events = {};
	}

	addEventListener(event: string, listener: Function) {

		if (typeof this.events[event] !== 'object') {
			this.events[event] = [];
		}
		this.events[event].push(listener);
		return listener;
	}

	addEventSingleListener(event: string, listener: Function) {
		if (typeof this.events[event] !== 'object') {
			this.events[event] = [];
		}
		this.events[event] = [listener]
		return listener;
	}


	removeListener(event: string, listener: Function) {
		if (typeof this.events[event] === 'object') {
			const idx = this.events[event].indexOf(listener);
			if (idx > -1) {
				this.events[event].splice(idx, 1);
			}
			if (this.events[event].length === 0) {
				delete this.events[event];
			}
		}
	}

	generateKey(type: number, key?: string): string {
		if (type === IModel.IClient.SocketTypeEnum.MESSAGE) {
			return 'msg_' + key
		}
		if (type === IModel.IClient.SocketTypeEnum.SOCKET_JOIN) {
			return 'SOCKET_JOIN_EVENT'
		}
		if (type === IModel.IClient.SocketTypeEnum.GLOBAL_MESSAGE) {
			return 'GLOBAL_MESSAGE'
		}
		if (type === IModel.IClient.SocketTypeEnum.FRIEND_CHANGE) {
			return 'FRIEND_CHANGE'
		}
        return key ?? ""
    }

	generateChatTopic(chatId: string): string {
		return 'msg_' + chatId
	}


	/**
	 *
	 */
	emit(event: string, ...args: IEvent[]) {
		console.log('[event] emit', event);
		console.log(typeof this.events[event]);

		if (typeof this.events[event] === 'object') {
			this.events[event].forEach((listener: Function) => {
				try {
					listener.apply(this, args);
				} catch (e) {
					console.error('[event error]', e)
				}
			});
		}
	}
}

const events = new EventEmitter();
export default events;
