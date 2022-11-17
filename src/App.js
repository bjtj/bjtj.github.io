import './App.css';
import Header from './Header';
import Footer from './Footer';


function App() {
  return (
    <div className="App">
      <Header />
      <div className="App-content">
        <p>
          Go to <a className="App-link" href="https://github.com/bjtj" target="_blank" rel="noreferrer">Github</a>
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default App;
