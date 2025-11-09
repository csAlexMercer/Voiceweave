const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});


exports.onPollResolved = functions.firestore
  .document('polls/{pollId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();


    if (newData.status === 'resolved' && previousData.status === 'active') {
      const pollId = context.params.pollId;
      
      try {

        const weaveDoc = await admin.firestore()
          .collection('weaves')
          .doc(newData.weaveID)
          .get();

        if (!weaveDoc.exists) {
          console.error('Weave not found');
          return null;
        }

        const weaveData = weaveDoc.data();
 
        const authorityEmails = weaveData.authorityEmails || weaveData.emails || [];

        if (authorityEmails.length === 0) {
          console.log('No authority emails to notify for weave:', newData.weaveID);
          return null;
        }

        const totalVotes = Object.values(newData.votes).reduce((a, b) => a + b, 0);
        const results = Object.entries(newData.votes)
          .map(([option, count]) => ({
            option,
            count,
            percentage: ((count / totalVotes) * 100).toFixed(1)
          }))
          .sort((a, b) => b.count - a.count);

        const emailSubject = `[VoiceWeave] Poll Resolved: ${newData.pollQuestion}`;
        const emailBody = generateEmailHTML(newData, weaveData, results, totalVotes);

        const emailPromises = authorityEmails.map(email => 
          sendEmail(email, emailSubject, emailBody)
        );

        await Promise.all(emailPromises);
        
        console.log(`Sent ${authorityEmails.length} notification emails to authorities for poll ${pollId}`);
        return null;
      } catch (error) {
        console.error('Error sending poll resolution emails:', error);
        return null;
      }
    }

    return null;
  });

// Helper function to generate email HTML
function generateEmailHTML(pollData, weaveData, results, totalVotes) {
  const winningOption = results[0];
  const createdDate = new Date(pollData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .content {
          padding: 40px 30px;
        }
        .authority-notice {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .authority-notice strong {
          color: #856404;
        }
        .poll-question {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 24px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .meta-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .meta-item {
          margin: 8px 0;
          font-size: 14px;
          color: #666;
          display: flex;
          align-items: center;
        }
        .meta-item strong {
          color: #333;
          margin-left: 8px;
        }
        .results-section {
          margin: 32px 0;
        }
        .results-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
        }
        .result-item {
          margin: 16px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .result-item.winner {
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
          border-left-color: #4caf50;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .result-option {
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }
        .result-votes {
          color: #666;
          font-size: 14px;
        }
        .progress-bar {
          height: 10px;
          background: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 5px;
          transition: width 0.3s ease;
        }
        .winner-badge {
          display: inline-block;
          background: #4caf50;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 12px;
        }
        .summary-box {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
          border-left: 4px solid #2196f3;
        }
        .summary-box h3 {
          margin-top: 0;
          color: #1976d2;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 16px 0;
        }
        .footer-note {
          margin-top: 24px;
          font-size: 12px;
          color: #999;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🗳️</div>
          <h1>Community Poll Resolved</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">VoiceWeave Community Decision System</p>
        </div>
        
        <div class="content">
          <div class="authority-notice">
            <strong>📧 Authority Notification:</strong> You are receiving this email as a designated authority for ${weaveData.title}. This poll has reached its vote goal and requires your attention.
          </div>

          <p style="font-size: 16px; color: #666;">
            A community poll in <strong style="color: #667eea;">${weaveData.title}</strong> has been successfully resolved after reaching its vote goal. Below are the complete results and community decision.
          </p>
          
          <div class="poll-question">
            <strong>Poll Question:</strong><br/>
            ${pollData.pollQuestion}
          </div>
          
          <div class="meta-info">
            <div class="meta-item">
              📊 <strong>Poll Type:</strong> ${pollData.pollType === 'petition' ? 'Petition (Yes/No)' : 'Multiple Choice'}
            </div>
            <div class="meta-item">
              📅 <strong>Created:</strong> ${createdDate}
            </div>
            <div class="meta-item">
              🗳️ <strong>Total Votes:</strong> ${totalVotes} participants
            </div>
            <div class="meta-item">
              🎯 <strong>Vote Goal:</strong> ${pollData.voteGoal} (Achieved ✓)
            </div>
            <div class="meta-item">
              ${pollData.isAnonymous ? '🔒 <strong>Voting Type:</strong> Anonymous' : '👤 <strong>Voting Type:</strong> Public'}
            </div>
            <div class="meta-item">
              💬 <strong>Comments:</strong> ${pollData.commentCount || 0} community discussions
            </div>
          </div>
          
          <div class="summary-box">
            <h3>📈 Community Decision Summary</h3>
            <p style="margin: 8px 0;">
              <strong>Winning Option:</strong> ${winningOption.option}<br/>
              <strong>Support Level:</strong> ${winningOption.percentage}% (${winningOption.count} votes)<br/>
              <strong>Consensus:</strong> ${parseFloat(winningOption.percentage) >= 60 ? 'Strong' : parseFloat(winningOption.percentage) >= 50 ? 'Moderate' : 'Mixed'}
            </p>
          </div>

          <div class="results-section">
            <div class="results-title">📊 Detailed Voting Results</div>
            ${results.map((result, index) => `
              <div class="result-item ${index === 0 ? 'winner' : ''}">
                <div class="result-header">
                  <span class="result-option">
                    ${result.option}
                    ${index === 0 ? '<span class="winner-badge">✓ Community Choice</span>' : ''}
                  </span>
                  <span class="result-votes">${result.count} votes (${result.percentage}%)</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${result.percentage}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
          
          ${pollData.commentCount > 0 ? `
            <p style="margin-top: 32px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
              💬 <strong>${pollData.commentCount}</strong> community members shared their thoughts and perspectives on this poll. View the complete discussion thread for deeper insights.
            </p>
          ` : ''}

          <div style="margin-top: 32px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong style="color: #856404;">⚡ Action Required:</strong>
            <p style="margin: 8px 0 0 0; color: #856404;">
              As a designated authority, please review these results and take appropriate action based on your community's governance procedures.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">
            View complete poll details and community discussion
          </p>
          <a href="${functions.config().app?.url || 'https://voiceweave.web.app'}/poll/${pollData.pollID}" class="button">
            View Full Poll Details →
          </a>
          
          <div class="footer-note">
            You received this email as a designated authority for <strong>${weaveData.title}</strong> on VoiceWeave.<br/>
            This notification is sent only to authority emails added during weave creation.<br/>
            Community members do not receive this notification.<br/><br/>
            <strong>VoiceWeave</strong> - Empowering Communities Through Democratic Decision-Making
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: {
      name: 'VoiceWeave',
      address: functions.config().email.user
    },
    to: to,
    subject: subject,
    html: html
  };

  try {
    await mailTransport.sendMail(mailOptions);
    console.log(`Authority notification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}

exports.cleanupOldPolls = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const oldPollsSnapshot = await admin.firestore()
        .collection('polls')
        .where('status', '==', 'resolved')
        .where('createdAt', '<', thirtyDaysAgo.toISOString())
        .get();

      if (oldPollsSnapshot.empty) {
        console.log('No old polls to clean up');
        return null;
      }

      const batch = admin.firestore().batch();
      oldPollsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${oldPollsSnapshot.size} old polls`);
      return null;
    } catch (error) {
      console.error('Error cleaning up old polls:', error);
      return null;
    }
  });

// Analytics: Track poll engagement
exports.trackPollEngagement = functions.firestore
  .document('polls/{pollId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    const newVoteCount = Object.values(newData.votes).reduce((a, b) => a + b, 0);
    const previousVoteCount = Object.values(previousData.votes).reduce((a, b) => a + b, 0);

    // If votes increased, update weave analytics
    if (newVoteCount > previousVoteCount) {
      try {
        const weaveRef = admin.firestore().collection('weaves').doc(newData.weaveID);
        
        await weaveRef.update({
          totalVotes: admin.firestore.FieldValue.increment(1),
          lastActivity: new Date().toISOString()
        });

        console.log(`Updated analytics for weave ${newData.weaveID}`);
      } catch (error) {
        console.error('Error updating analytics:', error);
      }
    }

    return null;
  });