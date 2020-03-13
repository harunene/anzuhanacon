import React, { Component } from 'react';
import debounce from 'lodash-es/debounce';
import SearchField from 'react-search-field';

import ItemList from './ItemList';

import './App.css';

import initialData from './initialData.json';

const PAGE_SIZE = 5;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: null,

      // search terms splitted by space
      keywords: [],

      allItems: [],
      matchedItems: [],

      page: PAGE_SIZE
    };
  }

  async componentDidMount(){
    this.setState({ allItems: initialData.map(this.mapRemoteData) });

    try {
      const allItems = await fetch('https://api.github.com/repos/astrine/eroge_radio/contents/img/')
        .then(res => res.json())
        .then(this.mapRemoteData);
      this.setState({ allItems, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  componentWillMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  mapRemoteData = item => {
    return {
      name: item.name.split('.')[0],
      src: item.download_url,
    };
  };

  onScroll = debounce(() => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.setState({
        page: this.state.page + PAGE_SIZE
      });
    }
  }, 300);

  onKeywordChanged = debounce(async (search) => {
    const keywords = search.toLowerCase().split(' ').filter(Boolean);
    const matchedItems = this.getMatchedItems(keywords);
    this.setState({
      matchedItems,
      keywords,
      page: PAGE_SIZE
    });
  }, 300);

  getMatchedItems = (keywords) => {
    if (!keywords) return this.state.allItems;
    return this.state.allItems
      .filter(item => item.name.toLowerCase().match(keywords.join("|")));
  };

  render() {
    const isLoading = this.state.loading;
    const hasError = !!this.state.error;
    const hasKeywords = this.state.keywords.length > 0;
    const itemCount = hasKeywords
      ? this.state.matchedItems.length
      : this.state.allItems.length;
    const found = itemCount >= 0;

    return (
      <div className="react-search-field-demo container">
        <header>
          <h1 className="title">안즈하나콘 검색기</h1>
          <p className="description">
            {`오토메 도메인 라디오 메이든(オトメ＊ドメイン RADIO＊MAIDEN) 등에서 나온 명대사를 검색할 수 있습니다.
            대사들이 다소 수위가 있고 남성향 에로게 관련 대사가 다수 등장하므로 이용에 주의 부탁드립니다.`}
          </p>

          <SearchField
            placeholder="검색어를 입력하세요"
            onChange={this.onKeywordChanged}
          />

          <div className="box search-result">
            {isLoading && (
              `로딩중입니다...`
            )}
            {!isLoading && hasError && (
              `로딩 실패 ㅠㅠ`
            )}
            {!isLoading && !hasError && (
              `${itemCount} 개의 결과가 있습니다.`
            )}
            {!isLoading && !hasError && !found && (
              `결과가 없어요 ㅠㅠ`
            )}
          </div>
        </header>

        <main className="main">
          {!isLoading && (
            <ItemList
              list={hasKeywords
                ? this.state.matchedItems.slice(0, this.state.page)
                : this.state.allItems
              }
              keywords={this.state.keywords}
            />
          )}
        </main>
      </div>
    );
  }
}

export default App;
