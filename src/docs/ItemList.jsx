import React, { Component } from 'react';

import Item from './Item';

class ImageList extends Component {
  render() {
    return (
      <ul className="item-list">
        {this.props.list.map(item =>
          <Item
            key={item.src}
            keywords={this.props.keywords}
            {...item}
          />
        )}
      </ul>
    )
  }
};

export default ImageList;
