import React, { useState, useEffect } from "react";
import { 
  Bus, 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  AlertCircle, 
  Award,
  Users,
  Zap,
  ChevronRight,
  Search,
  Filter,
  Tag,
  Share2,
  BookOpen,
  MessageCircle
} from "lucide-react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import useBlockInspect from "../hooks/useBlockInspect";

// Mock blog data - replace with actual data source
const blogPosts = [
  {
    id: 1,
    title: "New AC Bus Routes Launched Between Colombo and Jaffna",
    excerpt: "The Sri Lanka Transport Board has announced the introduction of five new luxury AC bus routes connecting Colombo to Jaffna, promising enhanced comfort for long-distance travelers.",
    content: "In a significant development for public transportation, the Sri Lanka Transport Board (SLTB) has officially launched five new air-conditioned bus routes between Colombo and Jaffna. These premium services aim to provide travelers with enhanced comfort during the 8-hour journey...",
    category: "Route Updates",
    date: "2025-11-15",
    author: "Kasun Perera",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800",
    readTime: "5 min read",
    tags: ["AC Buses", "New Routes", "Colombo", "Jaffna"]
  },
  {
    id: 2,
    title: "Major Accident on Kandy-Colombo Highway: Safety Measures Needed",
    excerpt: "A serious bus accident near Kadawatha has raised concerns about highway safety. Authorities are investigating the incident and reviewing safety protocols.",
    content: "A tragic accident involving a semi-luxury bus on the Colombo-Kandy highway has prompted urgent calls for improved safety measures. The incident occurred early morning near Kadawatha, resulting in multiple injuries...",
    category: "Safety & Accidents",
    date: "2025-11-14",
    author: "Nimal Silva",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
    readTime: "7 min read",
    tags: ["Safety", "Accidents", "Highway", "Kandy"]
  },
  {
    id: 3,
    title: "Digital Ticketing System Rollout Across Major Cities",
    excerpt: "SLTB introduces contactless payment systems in buses operating in Colombo, Kandy, and Galle, modernizing the passenger experience.",
    content: "The Sri Lanka Transport Board is revolutionizing public transport with the introduction of digital ticketing across major cities. Starting this month, passengers can use contactless payment cards and mobile apps...",
    category: "Technology",
    date: "2025-11-12",
    author: "Dilini Fernando",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    readTime: "4 min read",
    tags: ["Digital", "Technology", "Payment", "SLTB"]
  },
  {
    id: 4,
    title: "Bus Fare Revision: What You Need to Know",
    excerpt: "New fare structure announced for all bus categories. Understanding the changes and how they affect your daily commute.",
    content: "The National Transport Commission has announced a revised fare structure effective from December 1st, 2025. The changes affect Normal, Semi-Luxury, and AC bus services across the island...",
    category: "Fares & Regulations",
    date: "2025-11-10",
    author: "Sampath Wickramasinghe",
    image: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=800",
    readTime: "6 min read",
    tags: ["Fares", "Regulations", "NTC", "Pricing"]
  },
  {
    id: 5,
    title: "Eco-Friendly Buses: Sri Lanka's Green Initiative",
    excerpt: "Government announces plans to introduce electric buses in major cities as part of environmental sustainability efforts.",
    content: "In line with global environmental trends, Sri Lanka is taking significant steps towards sustainable public transport. The government has unveiled plans to introduce 100 electric buses in Colombo by 2026...",
    category: "Environment",
    date: "2025-11-08",
    author: "Anura Rajapaksha",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
    readTime: "5 min read",
    tags: ["Electric", "Environment", "Green", "Sustainability"]
  },
  {
    id: 6,
    title: "Peak Season Travel Tips for December",
    excerpt: "Essential advice for travelers during the busy December holiday season. Learn how to plan your bus journeys effectively.",
    content: "As December approaches with its festive season and holidays, bus travel across Sri Lanka sees a significant surge. Here are expert tips to ensure smooth travel during peak season...",
    category: "Travel Tips",
    date: "2025-11-05",
    author: "Chamila Gunawardana",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    readTime: "4 min read",
    tags: ["Travel Tips", "Holiday", "Planning", "December"]
  }
];

const categories = ["All", "Route Updates", "Safety & Accidents", "Technology", "Fares & Regulations", "Environment", "Travel Tips"];

const Blog = () => {
  useBlockInspect();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);
  const [language, setLanguage] = useState("en");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery]);

  const getCategoryColor = (category) => {
    const colors = {
      "Route Updates": "bg-blue-100 text-blue-700 border-blue-300",
      "Safety & Accidents": "bg-red-100 text-red-700 border-red-300",
      "Technology": "bg-purple-100 text-purple-700 border-purple-300",
      "Fares & Regulations": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "Environment": "bg-green-100 text-green-700 border-green-300",
      "Travel Tips": "bg-indigo-100 text-indigo-700 border-indigo-300"
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="text-blue-600" size={32} />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BusInfo.click Blog</h1>
            </div>
            <button
              onClick={() => setSelectedPost(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              ← Back to Blog
            </button>
          </div>
        </header>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Featured Image */}
            <img 
              src={selectedPost.image} 
              alt={selectedPost.title}
              className="w-full h-64 sm:h-96 object-cover"
            />

            {/* Article Header */}
            <div className="p-8 sm:p-12">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getCategoryColor(selectedPost.category)}`}>
                  {selectedPost.category}
                </span>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar size={16} className="mr-2" />
                  {new Date(selectedPost.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock size={16} className="mr-2" />
                  {selectedPost.readTime}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                {selectedPost.title}
              </h1>

              <div className="flex items-center gap-3 mb-8 pb-8 border-b-2 border-gray-200">
                <User className="text-gray-400" size={40} />
                <div>
                  <p className="font-semibold text-gray-900">{selectedPost.author}</p>
                  <p className="text-sm text-gray-600">Contributing Writer</p>
                </div>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {selectedPost.content}
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Points</h2>
                <ul className="space-y-2 mb-6">
                  <li className="text-gray-700">Enhanced safety measures are being implemented across all routes</li>
                  <li className="text-gray-700">Passengers are advised to follow updated guidelines</li>
                  <li className="text-gray-700">Technology integration is improving service quality</li>
                  <li className="text-gray-700">Regular maintenance schedules ensure vehicle safety</li>
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t-2 border-gray-200">
                {selectedPost.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-300"
                  >
                    <Tag size={14} className="inline mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-semibold">Share this article:</p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-semibold">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">

    <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm font-medium mb-4 animate-fade-in">
              🚍 Stay Updated with Sri Lankan Bus News
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 animate-slide-down">
              News, Updates & Travel Insights
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto animate-fade-in">
              Your trusted source for bus transportation news, safety updates, and travel tips across Sri Lanka
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 text-center">
          <div className="p-4 rounded-xl bg-blue-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer animate-slide-up">
            <BookOpen size={32} className="mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-700">{blogPosts.length}+</p>
            <p className="text-gray-600 font-semibold">Articles Published</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer animate-slide-up">
            <Users size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-700">50k+</p>
            <p className="text-gray-600 font-semibold">Monthly Readers</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer animate-slide-up">
            <Award size={32} className="mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-700">Daily</p>
            <p className="text-gray-600 font-semibold">Fresh Updates</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles by title, tags, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-blue-600" size={20} />
              <h3 className="font-bold text-gray-800">Filter by Category</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-slide-up"
                  onClick={() => setSelectedPost(post)}
                >
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-gray-500 text-xs">
                        <Calendar size={14} className="mr-1" />
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <button className="flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                        Read More <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center animate-fade-in">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600 text-lg font-semibold">
                No articles found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl mb-12 animate-slide-up">
            <div className="text-center max-w-2xl mx-auto">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
              <p className="text-blue-100 mb-6">
                Subscribe to our newsletter and never miss important bus transportation news and updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-white focus:outline-none"
              />

                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all transform active:scale-95 hover:scale-105 shadow-md hover:shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Section */}
      <section className="bg-blue-50 py-12 border-t-4 border-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Trust BusInfo.click Blog?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Award size={40} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Verified Information</h3>
              <p className="text-sm text-gray-600">All news verified from official sources</p>
            </div>
            <div>
              <Zap size={40} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Timely Updates</h3>
              <p className="text-sm text-gray-600">Breaking news and real-time alerts</p>
            </div>
            <div>
              <Users size={40} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Community Focused</h3>
              <p className="text-sm text-gray-600">Written for Sri Lankan commuters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <Footer/>
    </div>
  );
};

export default Blog;