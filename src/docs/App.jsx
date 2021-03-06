import React, { Component } from 'react';
import debounce from 'lodash-es/debounce';
import SearchField from 'react-search-field';

import ItemList from './ItemList';

import './App.css';

import initialData from './initialData.json';

const PAGE_SIZE = 10;

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
        .then(res => res.map(this.mapRemoteData));
      this.setState({ allItems, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
      setTimeout(() => this.setState({ error: null }), 3000);
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
    const matchFunc = item => item.name.toLowerCase().match(keywords.join("|"));
    const matchedItems = this.state.allItems.filter( matchFunc );
    this.setState({
      matchedItems,
      keywords,
      page: PAGE_SIZE,
      error: null
    });
    window.scrollTo(0, 0);
  }, 300);

  render() {
    const isLoading = this.state.loading;
    const hasError = !!this.state.error;
    const hasKeywords = this.state.keywords.length > 0;
    const itemCount = hasKeywords
      ? this.state.matchedItems.length
      : this.state.allItems.length;
    const found = itemCount >= 0;

    return (
      <div className="App container">
        <searchPanel className="searchPanel">
          <SearchField
            placeholder="검색어를 입력하세요"
            onChange={this.onKeywordChanged}
          />
          <div className="box search-result">
            {isLoading && (
              `로딩중입니다...`
            )}
            {!isLoading && hasError && (
              `로딩 실패 ㅠㅠ 저장된 데이터를 사용합니다.`
            )}
            {!isLoading && !hasError && (
              `${itemCount} 개의 결과가 있습니다.`
            )}
            {!isLoading && !hasError && !found && (
              `결과가 없어요 ㅠㅠ`
            )}
          </div>
        </searchPanel>

        <header>
          <h1 className="title">안즈하나콘 검색기</h1>
          <p className="description">
            {`오토메 도메인 라디오 메이든(オトメ＊ドメイン RADIO＊MAIDEN) 등에서 나온 명대사를 검색할 수 있습니다.
            대사들이 다소 수위가 있고 남성향 에로게 관련 대사가 다수 등장하므로 이용에 주의 부탁드립니다.`}
          </p>
        </header>
        
        <main className="main">
          {(
            <ItemList
              list={hasKeywords
                ? this.state.matchedItems.slice(0, this.state.page)
                : this.state.allItems.slice(0, this.state.page)
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
