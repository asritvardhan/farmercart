// utils/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  farmerApproved: (farmerName, farmerEmail) => ({
    from: process.env.EMAIL_FROM,
    to: farmerEmail,
    subject: '🎉 Your Farmer Cart Account Has Been Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5a27, #4caf50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #2d5a27; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Farmer Cart!</h1>
          <p>Your farming journey begins now</p>
        </div>
        <div class="content">
          <h2>Hello ${farmerName},</h2>
          <p>Great news! Your farmer account has been approved by our admin team.</p>
          
          <p><strong>You can now:</strong></p>
          <ul>
            <li>✅ Add your products to the marketplace</li>
            <li>✅ Start receiving orders from customers</li>
            <li>✅ Manage your inventory and orders</li>
            <li>✅ Build your farmer reputation</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/farmer/dashboard" class="button">Go to Your Dashboard</a>
          </div>
          
          <p>Need help getting started? Check out our <a href="#">Farmer Guide</a>.</p>
          <p>Happy farming! 🌱</p>
        </div>
        <div class="footer">
          <p><strong>The Farmer Cart Team</strong></p>
          <p>Connecting farmers directly with customers</p>
        </div>
      </body>
      </html>
    `
  }),

  farmerRejected: (farmerName, farmerEmail, reason) => ({
    from: process.env.EMAIL_FROM,
    to: farmerEmail,
    subject: 'Update on Your Farmer Cart Application',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="content">
          <h2>Application Update</h2>
          <p>Dear ${farmerName},</p>
          <p>After carefully reviewing your application, we're unable to approve your farmer account at this time.</p>
          
          ${reason ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Reason:</strong> ${reason}
            </div>
          ` : ''}
          
          <p>If you believe this is a mistake or would like to provide additional information, 
          please contact our support team by replying to this email.</p>
          
          <p>We appreciate your interest in Farmer Cart and encourage you to apply again in the future 
          if your circumstances change.</p>
          
          <p>Best regards,<br><strong>The Farmer Cart Team</strong></p>
        </div>
        <div class="footer">
          <p>Farmer Cart - Direct from farm to table</p>
        </div>
      </body>
      </html>
    `
  }),

  orderConfirmation: (userName, userEmail, orderDetails) => ({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: '✅ Your Farmer Cart Order is Confirmed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5a27, #4caf50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .order-details { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2d5a27; }
          .button { background: #2d5a27; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order, ${userName}!</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Your order has been received and is being processed by our farmers.</p>
          
          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId.slice(-8).toUpperCase()}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
            <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>You'll receive another email when your order ships with tracking information.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:5173/user/orders" class="button">Track Your Order</a>
          </div>
          
          <p>Thank you for supporting local farmers! 🚜</p>
        </div>
        
        <div class="footer">
          <p><strong>Farmer Cart</strong><br>Fresh produce, directly from farm to your table</p>
        </div>
      </body>
      </html>
    `
  }),

  orderStatusUpdate: (userName, userEmail, orderDetails) => ({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `📦 Order #${orderDetails.orderId.slice(-8).toUpperCase()} - ${orderDetails.status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .status-badge { 
            background: ${orderDetails.status === 'Delivered' ? '#4caf50' : orderDetails.status === 'Shipped' ? '#2196f3' : '#ff9800'}; 
            color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; 
          }
          .button { background: #2d5a27; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2>Order Update</h2>
          <p>Hi ${userName},</p>
          
          <p>Your order <strong>#${orderDetails.orderId.slice(-8).toUpperCase()}</strong> has been updated:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge">${orderDetails.status}</span>
          </div>
          
          ${orderDetails.status === 'Shipped' ? `
            <p>🎉 Your order is on the way! Our delivery partner will contact you soon.</p>
            <p>Expected delivery: Within 2-3 business days</p>
          ` : ''}
          
          ${orderDetails.status === 'Delivered' ? `
            <p>🎊 Your order has been delivered! We hope you enjoy your fresh produce.</p>
            <p>Please consider leaving a review for the farmers - it helps them grow!</p>
          ` : ''}
          
          ${orderDetails.status === 'Accepted' ? `
            <p>👨‍🌾 The farmers have accepted your order and are preparing your items.</p>
            <p>You'll receive another update when your order ships.</p>
          ` : ''}
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:5173/user/orders" class="button">View Order Details</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Farmer Cart</strong> - Fresh from the farm</p>
        </div>
      </body>
      </html>
    `
  }),
farmerOrderNotification: (farmerName, farmerEmail, orderDetails) => ({
  from: process.env.EMAIL_FROM,
  to: farmerEmail,
  subject: `📦 New Order Received - #${orderDetails.orderId.slice(-8).toUpperCase()}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2d5a27, #4caf50); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .order-details { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2d5a27; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Order Alert 🚜</h2>
        <p>Hi ${farmerName}, you have received a new order!</p>
      </div>

      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> #${orderDetails.orderId.slice(-8).toUpperCase()}</p>
        <p><strong>Product:</strong> ${orderDetails.productName}</p>
        <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
        <p><strong>Price:</strong> ₹${orderDetails.price}</p>
      </div>

      <div class="order-details">
        <h3>Buyer Information</h3>
        <p><strong>Name:</strong> ${orderDetails.buyerName}</p>
        <p><strong>Email:</strong> ${orderDetails.buyerEmail}</p>
        <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>
      </div>

      <div class="footer">
        <p><strong>Farmer Cart</strong> - Bringing farmers and customers closer</p>
      </div>
    </body>
    </html>
  `
}),

  welcomeUser: (userName, userEmail) => ({
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: '🌱 Welcome to Farmer Cart!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5a27, #4caf50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .button { background: #2d5a27; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Farmer Cart!</h1>
          <p>Fresh produce, directly from local farmers</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hello ${userName},</h2>
          <p>Welcome to Farmer Cart! We're excited to have you join our community of fresh food lovers.</p>
          
          <p><strong>Get started:</strong></p>
          <ul>
            <li>🛒 Browse products from local farmers</li>
            <li>👨‍🌾 Support your local farming community</li>
            <li>🚚 Get fresh produce delivered to your door</li>
            <li>⭐ Rate and review your experiences</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:5173" class="button">Start Shopping</a>
          </div>
          
          <p>If you have any questions, just reply to this email - we're happy to help!</p>
        </div>
        
        <div class="footer">
          <p><strong>Farmer Cart Team</strong><br>Connecting you with the freshest local produce</p>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (templateName, data) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template ${templateName} not found`);
    }

    const emailOptions = template(...data);
    
    const { data: result, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`✅ Email sent successfully to ${emailOptions.to}`);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw error - fail silently for non-critical emails
    return null;
  }
};

module.exports = { sendEmail };