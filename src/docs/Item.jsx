import React, { PureComponent } from 'react';
import Highlighter from 'react-highlight-words';

class Item extends PureComponent {
  render() {
    return (
      <li className="item">
        <a
          className="box"
          href={this.props.src}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Highlighter
            className="item__name"
            highlightClassName="matched"
            searchWords={this.props.keywords || []}
            textToHighlight={this.props.name || ""}
          />
          <div className="item__image-wrapper">
            <img className="item__image" src={this.props.src} loading="lazy" />
          </div>
        </a>
      </li>
    );
  }
}

export default Item;
