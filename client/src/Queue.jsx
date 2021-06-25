import React from 'react';


const Queue = ({ queue }) => {
  return (
    <div className="queue">
      <h2>Queue</h2>
      <ul>
        {queue.map(video => (<li>${video}</li>))}
      </ul>
    </div>
  );
};

export default Queue;
