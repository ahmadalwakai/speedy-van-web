# Movan & Man Web App

A Next.js-based web application for a delivery service, allowing users to book, track, and manage delivery orders with payment integration.

## Features

- User authentication (login/register)
- Create and cancel delivery orders with Stripe payment
- Real-time order tracking with WebSocket
- Order history with pagination
- Multi-language support (English/Arabic)
- Push notifications via Firebase
- Secure input sanitization
- Error logging with Winston
- Unit tests with Jest

## Prerequisites

- Node.js >= 18
- Google Maps API Key
- Firebase Project (for notifications)
- Stripe Account (for payments)

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd web-app