#!/usr/bin/env python

import os
import sys
import json
import logging
import argparse
from messenger import Messenger

logger = logging.getLogger('stat')
logging.basicConfig(level=logging.DEBUG)

APPKEY = '56a0a88c4407a3cd028ac2fe'
TOPIC_PRESENCE = 'bullet/p'
TOPIC_LIKE = 'like'
ALIAS = 'stat'

class Stat(Messenger):

    def __init__(self, appkey, alias, customid, file, presence, like):
        self.__logger = logging.getLogger('stat.Stat')
        self.__logger.debug('init')
        Messenger.__init__(self, appkey, alias, customid)

        self.file = file

        self.data = {}
        self.data['presence'] = presence
        self.data['like'] = like

        if presence != 0 or like != 0:
            self.write_data()
        else:
            self.read_data()

    def __del__(self):
        self.__logger.debug('del')

    def on_message(self, args):
        self.__logger.debug('on_message: %s', args)

        if not isinstance(args, dict):
            return

        if args['topic'] == TOPIC_PRESENCE:
            msg = json.loads(args['msg'])
            if msg['alias'] != self.alias:
                if msg['action'] == 'join':
                    self.data['presence'] += 1
                    self.publish_to_alias(msg['alias'], json.dumps(self.data))
                elif msg['action'] == 'offline':
                    self.data['presence'] -= 1
                self.write_data()
            self.__logger.debug(self.data)
        elif args['topic'] == TOPIC_LIKE:
            self.data['like'] += 1
            self.write_data()
            self.__logger.debug(self.data)

    def on_set_alias(self, args):
        self.__logger.debug('on_set_alias: %s', args)
        self.socketIO.emit('subscribe', {'topic': TOPIC_LIKE})
        self.socketIO.emit('subscribe', {'topic': TOPIC_PRESENCE})

    def read_data(self):
        if not os.path.exists(self.file):
            return

        with open(self.file, 'r') as f:
            data = f.read()
            self.data = json.loads(data)

    def write_data(self):
        with open(self.file, 'w') as f:
            data = json.dumps(self.data)
            f.write(data)

def main():
    parser = argparse.ArgumentParser(description='Statistics for Yunba-live-video demo')
    parser.add_argument('--file', '-f', type=str, help='The path of data file', default='./stat.json')
    parser.add_argument('--presence', '-p', type=int, help='initial presence number', default=0)
    parser.add_argument('--like', '-l', type=int, help='initial like number', default=0)
    args = parser.parse_args()

    stat = Stat(APPKEY, ALIAS, ALIAS, args.file, args.presence, args.like)

    while True:
        stat.loop()

if __name__ == '__main__':
    main()
