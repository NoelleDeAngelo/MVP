# WatchThis

WatchThis is a web application that allows users to get together in private rooms to video chat while watching YouTube videos that are synced for all users in the room.

## Project Status:

This project is in development. Currently, users can create new rooms, join existing rooms, add YouTube videos to the queue to be played, and play/pause current videos.


### Use
Visiting the main page will automatically create and redirect you to a new room. To invite people to your private room, give them your room’s url. 

YouTube videos can be added to the WatchThis queue by adding the link provided by the Youtube “share” button. 



## Installation and Setup Locally

* Install PeerJS globaly
``` sh
npm install -g peer
```
* Install npm packages
``` sh
npm install
```
* Start peerJS server
``` sh
peerjs --port 3001
```
* Run webpack
 ``` sh
npm run prod-react
```
* Start server
 ``` sh
npm run server
```
* Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technologies Used

- [React](https://reactjs.org/)
- [Node](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [PeerJS](https://peerjs.com/)
- [Socket.io](https://socket.io/)
