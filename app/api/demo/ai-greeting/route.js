import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { time } = await request.json();
    
    // Generate time-based greeting
    let timeOfDay = 'day';
    if (time < 12) timeOfDay = 'morning';
    else if (time < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    // Use Anthropic API for personalized greeting
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          temperature: 0.9,
          messages: [{
            role: 'user',
            content: `Generate a short, enthusiastic greeting for a demo user exploring a business management platform in the ${timeOfDay}. 
            The platform has 4 modules: HubCRM (customer management), Ads Master (advertising), LeadWarm (email warmup), and Fidalyz (loyalty programs).
            Make it welcoming, professional yet friendly, and encourage exploration. Maximum 2 sentences. Include relevant emoji.`
          }]
        });

        return NextResponse.json({
          greeting: message.content[0].text
        });
      } catch (apiError) {
        console.error('Anthropic API error:', apiError);
        // Fallback to static greetings
      }
    }

    // Fallback static greetings
    const greetings = {
      morning: [
        "Good morning! ☀️ Ready to supercharge your business? Explore our powerful modules and see how DigiFlow Hub can transform your operations.",
        "Rise and shine! 🌅 Your demo dashboard is loaded with real-time data. Dive into any module to experience the future of business management.",
        "Morning champion! 💪 Today's a perfect day to discover how our AI-powered tools can 10x your productivity."
      ],
      afternoon: [
        "Good afternoon! 🚀 Your business command center is ready. Each module is designed to give you superpowers in managing your operations.",
        "Welcome back! 📊 Real-time metrics are flowing in. Click any module to see how we turn data into actionable insights.",
        "Afternoon explorer! 🎯 Ready to see magic? Our AI is analyzing patterns across all modules to help you make better decisions."
      ],
      evening: [
        "Good evening! 🌙 Even after hours, your digital workforce never sleeps. Check out how our automation keeps working for you 24/7.",
        "Evening visionary! ✨ Time to see what modern business management looks like. Each module is a gateway to efficiency.",
        "Welcome to the night shift! 🌃 While competitors sleep, DigiFlow Hub keeps optimizing your business processes."
      ]
    };

    const randomGreeting = greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)];

    return NextResponse.json({
      greeting: randomGreeting
    });
  } catch (error) {
    console.error('Greeting generation error:', error);
    return NextResponse.json({
      greeting: "Welcome to DigiFlow Hub! 🚀 Explore our powerful modules and discover how we can transform your business operations."
    });
  }
}