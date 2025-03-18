// File: api/download.js
import axios from 'axios';
import { parse } from 'url';

export default async function handler(req, res) {
  try {
    // Mengambil parameter URL dari permintaan
    const { url, format } = req.query;
    
    // Validasi URL
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Validasi format (default: video)
    const downloadFormat = format === 'audio' ? 'audio' : 'video';
    
    // Mengambil ID video dari URL YouTube
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Menentukan URL untuk pengunduhan berdasarkan format
    const downloadUrl = downloadFormat === 'audio' 
      ? `https://amp3.cc/api/json/mp3/${videoId}`
      : `https://amp4.cc/api/json/mp4/${videoId}`;
    
    // Mengambil informasi unduhan dari layanan
    const { data } = await axios.get(downloadUrl);
    
    // Mendapatkan link unduhan langsung
    let directDownloadUrl;
    if (downloadFormat === 'audio') {
      directDownloadUrl = data.mp3 || data.url || data.download_url;
    } else {
      directDownloadUrl = data.mp4 || data.url || data.download_url;
    }
    
    if (!directDownloadUrl) {
      return res.status(404).json({ error: 'Download link not found' });
    }
    
    // Redirect ke link unduhan langsung
    return res.redirect(directDownloadUrl);
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request',
      message: error.message 
    });
  }
}

// Fungsi untuk mengekstrak ID video dari URL YouTube
function extractVideoId(url) {
  try {
    // Menangani berbagai format URL YouTube
    const parsedUrl = parse(url, true);
    
    // Format www.youtube.com/watch?v=VIDEO_ID
    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.query.v) {
      return parsedUrl.query.v;
    }
    
    // Format youtu.be/VIDEO_ID
    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.substring(1);
    }
    
    // Format youtube.com/embed/VIDEO_ID
    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.pathname.includes('/embed/')) {
      return parsedUrl.pathname.split('/embed/')[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}
