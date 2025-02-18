import  React, { useState, useEffect } from "react";
import { AlertCircle, ChevronRight, Clock, Share2 } from 'lucide-react';

const hardcodedData = {
  "status": "ok",
  "totalResults": 10,
  "articles": [
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "Times Of India",
      "title": "Elderly warned of encounter, cheated of 35L",
      "description": "Mumbai: In a new version of the ‘digital arrest' scam, cyber fraudsters conned a 72-year-old woman, who lives alone, of Rs 35 lakh after accusing her .",
      "url": "https://timesofindia.indiatimes.com/city/mumbai/elderly-warned-of-encounter-cheated-of-35l/articleshow/117895090.cms",
      "urlToImage": "https://static.toiimg.com/thumb/msid-117518360,width-1070,height-580,imgsize-99331,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
      "publishedAt": "2025-02-03T19:17:31Z",
      "content": "10 most beautiful sea animals"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "Reuters",
      "title": "Bitcoin drops to three-week low as Trump tariffs rattle markets",
      "description": "Over the weekend, US President Donald Trump imposed 25% tariffs on Mexican and most Canadian imports, and 10% on goods from China, starting on Tuesday. Canada and Mexico, the top two US trading partners, immediately vowed retaliatory measures, and China said …",
      "url": "https://economictimes.indiatimes.com/tech/technology/bitcoin-drops-to-three-week-low-as-trump-tariffs-rattle-markets/articleshow/117885487.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117885529,width-1200,height-630,imgsize-91432,overlay-ettech/articleshow.jpg",
      "publishedAt": "2025-02-03T10:23:14Z",
      "content": "Cryptocurrency prices slid on Monday, with bitcoin at a three-week low, as the risk of a trade war spooked investors and caused a selloff across financial markets. Bitcoin, the world's biggest crypto… [+3173 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "TNN",
      "title": "Hyderabad retiree duped of Rs 8 lakh in ‘digital arrest’ scam",
      "description": "A 63-year-old retired government employee in Hyderabad fell victim to a digital arrest scam, losing ₹8 lakh. Cybercriminals, pretending to be telecom and CBI officials, accused him of money laundering and coerced him into transferring the money under threat o…",
      "url": "https://timesofindia.indiatimes.com/city/hyderabad/hyderabad-retiree-duped-of-rs-8-lakh-in-digital-arrest-scam/articleshow/117570747.cms",
      "urlToImage": "https://static.toiimg.com/thumb/msid-117570779,width-1070,height-580,imgsize-70902,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
      "publishedAt": "2025-01-26T04:26:42Z",
      "content": "8 Reasons why you must add almonds to the daily diet"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "PTI",
      "title": "CBI busts Rs 350 crore countrywide crypto ponzi scam",
      "description": "The CBI has registered a case against seven individuals involved in a Rs 350 crore crypto ponzi scam, conducting raids across multiple cities. The individuals were running fraudulent schemes promising high returns through cryptocurrency investments, leading t…",
      "url": "https://economictimes.indiatimes.com/news/india/cbi-busts-rs-350-crore-countrywide-crypto-ponzi-scam/articleshow/117526359.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117526389,width-1200,height-630,imgsize-6834,overlay-economictimes/articleshow.jpg",
      "publishedAt": "2025-01-24T13:55:23Z",
      "content": "The CBI has conducted search operations across seven locations after registering a case of Rs 350 crore crypto ponzi scam against seven persons, officials said Friday. The accused persons were allege… [+2609 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "ETtech",
      "title": "Tata’s big Pegatron deal; Everstone acquires Wingify",
      "description": "Tata acquires a controlling stake in Pegatron Technology India. This and more in today’s ETtech Top 5.",
      "url": "https://economictimes.indiatimes.com/tech/newsletters/tech-top-5/tatas-big-pegatron-deal-everstone-acquires-wingify/articleshow/117524930.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117524930,width-1070,height-580,imgsize-7994,overlay-ettech/editionshow.jpg",
      "publishedAt": "2025-01-24T13:30:22Z",
      "content": "Tata acquires a controlling stake in Pegatron Technology India. This and more in todays ETtech Top 5.Also in the letter:Payment gateways under ED lensFintechs eye Budget boostLTIMindtree appoints new… [+5813 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "The Feed",
      "title": "Donald Trump oath ceremony impact: Bitcoin scales record peak; Trump coin, Cryptocurrency mania grip US market",
      "description": "Bitcoin has reached the peak ahead of Donald Trump's inauguration on Monday.",
      "url": "https://economictimes.indiatimes.com/news/international/us/donald-trump-oath-ceremony-impact-bitcoin-scales-record-peak-trump-coin-cryptocurrency-mania-grip-us-market/articleshow/117400067.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117400196,width-1200,height-630,imgsize-98314,overlay-economictimes/articleshow.jpg",
      "publishedAt": "2025-01-20T12:44:43Z",
      "content": "Bitcoin hit a record high above $109,000 on Monday as Donald Trump, who has signaled plans to deregulate the cryptocurrency sector, prepares to be sworn in as US president, as per a report.Bitcoin su… [+2855 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "AP",
      "title": "Bitcoin soars past $100,000 ahead of possible early action on crypto by Trump",
      "description": "Bitcoin reaches $100,000 as anticipation grows for pro-crypto actions promised by incoming President Donald Trump. His commitment includes creating a U.S. crypto stockpile, implementing favorable regulations, and appointing a cryptocurrency advisor, while Bit…",
      "url": "https://economictimes.indiatimes.com/markets/cryptocurrency/bitcoin-soars-past-100000-ahead-of-possible-early-action-on-crypto-by-trump/articleshow/117339038.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117339080,width-1200,height-630,imgsize-66104,overlay-etmarkets/articleshow.jpg",
      "publishedAt": "2025-01-17T16:50:16Z",
      "content": "The price of bitcoin topped $100,000 again early Friday as a pumped up cryptocurrency industry expects early action by Donald Trump when he's sworn in as president next week.Once a skeptic who said a… [+5524 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "ET Online",
      "title": "\"Took loan to pay fraudsters...\": Bengaluru woman loses over Rs 1.2 crore in digital arrest scam",
      "description": "A Bengaluru woman lost over Rs 1.2 crore to fraudsters in a digital arrest scam, draining her savings and forcing her to take a loan. The scam started with an IVR call claiming her parcel contained illegal items, leading to a fake virtual investigation, fraud…",
      "url": "https://economictimes.indiatimes.com/news/new-updates/took-loan-to-pay-fraudsters-bengaluru-woman-loses-over-rs-1-2-crore-in-digital-arrest-scam/articleshow/117143591.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117143905,width-1200,height-630,imgsize-951152,overlay-economictimes/articleshow.jpg",
      "publishedAt": "2025-01-11T08:54:41Z",
      "content": "A 28-year-old woman from Bengaluru became the victim of a digital arrest scam and lost more than Rs 1.2 crore between December 21 and January 3. In a desperate attempt to pay the fraudsters, she even… [+2845 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "Vidhi Verma",
      "title": "Jumped deposit scam: Entering UPI pin casually can empty your bank account, know how you can protect yourself",
      "description": "Jumped deposit scam: Scammers are using innovative methods to target UPI users these days. ​Sending money into your bank account is the easiest way of winning trust quickly. And when you enter your UPI pin to check any such deposit transaction, you end up fal…",
      "url": "https://economictimes.indiatimes.com/wealth/save/jumped-deposit-scam-entering-upi-pin-casually-can-empty-your-bank-account-know-how-you-can-protect-yourself/articleshow/117109749.cms",
      "urlToImage": "https://img.etimg.com/thumb/msid-117111001,width-1200,height-630,imgsize-14058,overlay-etwealth/articleshow.jpg",
      "publishedAt": "2025-01-10T07:28:10Z",
      "content": "Cybercriminals keep coming up with new innovative ways to scam people of their money. Unified Payment Interface (UPI) has become the most popular way of digital payment in India, however, the conveni… [+4403 chars]"
    },
    {
      "source": {
        "id": "the-times-of-india",
        "name": "The Times of India"
      },
      "author": "Deepthi Sanjiv",
      "title": "Karnataka woman loses Rs 24 lakh in digital arrest scam",
      "description": "A woman from Karkala lost Rs 24 lakh in a digital arrest scam. She was called by someone posing as a Delhi Telecom department official. They claimed her Aadhaar was used for illegal activities. A fake CBI officer threatened her with an arrest warrant unless s…",
      "url": "https://timesofindia.indiatimes.com/mangaluru/karkala-woman-falls-victim-to-rs-24-lakh-digital-arrest-scam/articleshow/117045659.cms",
      "urlToImage": "https://static.toiimg.com/thumb/msid-117046565,width-1070,height-580,imgsize-38192,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
      "publishedAt": "2025-01-08T07:32:17Z",
      "content": "9 foods to keep your kidneys healthy"
    }
  ]
};
const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_API_KEY");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        console.error("Fetching error:", err);
        setError(true);
        setArticles(hardcodedData.articles);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse space-y-4 w-full max-w-md p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <h1 className="text-xl font-bold text-gray-800">Fraud Alert News</h1>
        <p className="text-sm text-gray-500 mt-1">Stay informed about latest fraud cases</p>
      </div>

      {/* News Feed */}
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {articles.map((article, index) => (
          <article 
            key={index} 
            className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:translate-y-[-2px]"
          >
            {/* Image Container */}
            {article.urlToImage && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              {/* Source and Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="font-medium">{article.source.name}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h2>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Read more
                  <ChevronRight size={16} />
                </a>

                <button 
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  onClick={() => navigator.share?.({
                    title: article.title,
                    text: article.description,
                    url: article.url
                  }).catch(console.error)}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 p-4 rounded-lg shadow-lg flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <p className="text-sm">Failed to fetch latest news. Showing cached data.</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;