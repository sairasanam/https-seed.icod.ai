import bcrypt from 'bcrypt';
import User from '../models/User';
import Person from '../models/Person';
import Action from '../models/Action';
import Initiative from '../models/Initiative';
import Organization from '../models/Organization';
import ContentLibraryItem from '../models/ContentLibraryItem';

const DEMO_USER = {
  email: 'demo@seeds.app',
  password: 'Seeds@1234',
  name: 'Demo User',
  location: 'Portland, OR',
};

export async function seedDatabase(): Promise<void> {
  console.log('[SEED] Starting database seed...');

  // Quick check: if demo user and content library already exist, skip most work
  const existingUser = await User.findOne({ email: DEMO_USER.email }).lean();
  const existingContentCount = await ContentLibraryItem.estimatedDocumentCount();

  if (existingUser && existingContentCount > 0) {
    // Verify all collections are populated — fast path for restarts
    const [peopleCount, initiativesCount, orgsCount] = await Promise.all([
      Person.countDocuments({ userId: existingUser._id }),
      Initiative.countDocuments({ userId: existingUser._id }),
      Organization.countDocuments({ userId: existingUser._id }),
    ]);

    if (peopleCount > 0 && initiativesCount > 0 && orgsCount > 0) {
      console.log('[SEED] All data already present — skipping seed (fast path)');
      return;
    }
  }

  // Create or update demo user
  let user = existingUser ? await User.findById(existingUser._id) : null;

  if (!user) {
    const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
    user = await User.create({
      ...DEMO_USER,
      password: hashedPassword,
      streakDays: 7,
      badges: ['Kindness Seedling', 'Community Sprout'],
      isEmailVerified: true, // Demo user is pre-verified
    });
    console.log('[SEED] Demo user created');
  } else {
    // Only re-hash if needed — use updateOne with upsert pattern
    const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
    user.password = hashedPassword;
    user.isEmailVerified = true; // Ensure demo user stays verified
    await user.save();
    console.log('[SEED] Demo user updated');
  }

  const userId = user._id;

  // Seed people (Inner Circle)
  const existingPeople = await Person.countDocuments({ userId });
  if (existingPeople === 0) {
    const people = [
      { name: 'Sarah Johnson', relationship: 'Sister', tags: ['family', 'close'], lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: 'Michael Chen', relationship: 'Best Friend', tags: ['friend', 'college'], lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { name: 'Emma Wilson', relationship: 'Colleague', tags: ['work', 'mentor'], lastContactDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { name: 'David Martinez', relationship: 'Neighbor', tags: ['neighbor', 'community'], lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { name: 'Lisa Thompson', relationship: 'Aunt', tags: ['family', 'extended'], lastContactDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      { name: 'James Lee', relationship: 'Gym Buddy', tags: ['friend', 'fitness'], lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: 'Rachel Green', relationship: 'Childhood Friend', tags: ['friend', 'long-distance'], lastContactDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { name: 'Tom Anderson', relationship: 'Former Teacher', tags: ['mentor', 'education'], lastContactDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
      { name: 'Maria Garcia', relationship: 'Coworker', tags: ['work', 'team'], lastContactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { name: 'Alex Rivera', relationship: 'Roommate', tags: ['friend', 'living'], lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ];

    const createdPeople = await Person.insertMany(
      people.map(p => ({ ...p, userId }))
    );
    console.log(`[SEED] Created ${createdPeople.length} people`);

    // Create some actions for these people
    const actions = [];
    for (let i = 0; i < createdPeople.length; i++) {
      const person = createdPeople[i];
      const numActions = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numActions; j++) {
        const completed = Math.random() > 0.3;
        actions.push({
          userId,
          personId: person._id,
          title: getSampleActionTitle(j),
          description: 'A thoughtful gesture to strengthen our connection',
          completed,
          completedAt: completed ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : undefined,
          tags: ['kindness', 'connection'],
        });
      }
    }
    await Action.insertMany(actions);
    console.log(`[SEED] Created ${actions.length} actions`);
  }

  // Seed initiatives (Community)
  const existingInitiatives = await Initiative.countDocuments({ userId });
  if (existingInitiatives === 0) {
    const initiatives = [
      {
        title: 'Neighborhood Cleanup Day',
        description: 'Organize a monthly cleanup of the local park with neighbors',
        category: 'Environment',
        participants: ['David Martinez', 'Sarah Johnson'],
        status: 'active',
        frequency: 'monthly',
        impactLevel: 'medium',
      },
      {
        title: 'Meal Train for New Parents',
        description: 'Coordinate meals for families who just had a baby',
        category: 'Support',
        participants: ['Emma Wilson', 'Maria Garcia'],
        status: 'completed',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        frequency: 'as-needed',
        impactLevel: 'high',
      },
      {
        title: 'Community Skill Share',
        description: 'Host workshops where neighbors teach each other skills',
        category: 'Education',
        participants: ['James Lee', 'Tom Anderson'],
        status: 'planned',
        frequency: 'quarterly',
        impactLevel: 'medium',
      },
      {
        title: 'Tip Night for Service Workers',
        description: 'Pool tips for local restaurant staff during slow season',
        category: 'Support',
        participants: ['Michael Chen', 'Alex Rivera'],
        status: 'completed',
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        frequency: 'seasonal',
        impactLevel: 'high',
      },
      {
        title: 'Free Little Library Setup',
        description: 'Install and maintain a book exchange box in the neighborhood',
        category: 'Community',
        participants: ['Lisa Thompson'],
        status: 'active',
        frequency: 'ongoing',
        impactLevel: 'low',
      },
    ];

    await Initiative.insertMany(
      initiatives.map(i => ({ ...i, userId }))
    );
    console.log(`[SEED] Created ${initiatives.length} initiatives`);
  }

  // Seed organizations (Outer Circle)
  const existingOrgs = await Organization.countDocuments({ userId });
  if (existingOrgs === 0) {
    const organizations = [
      {
        name: 'Local Food Bank',
        type: 'nonprofit',
        description: 'Providing meals to families in need',
        website: 'https://example.org/foodbank',
        donationLink: 'https://example.org/donate',
        serviceLink: 'https://example.org/volunteer',
        opportunities: ['Sort donations', 'Deliver meals', 'Help at distribution events'],
        followed: true,
      },
      {
        name: 'Grace Community Church',
        type: 'church',
        description: 'Local church with active community programs',
        website: 'https://example.org/gracechurch',
        opportunities: ['Youth mentoring', 'Food pantry', 'Building maintenance'],
        followed: true,
      },
      {
        name: 'Environmental Action Network',
        type: 'cause',
        description: 'Advocating for sustainable practices and conservation',
        website: 'https://example.org/ean',
        donationLink: 'https://example.org/ean/donate',
        opportunities: ['Tree planting', 'Beach cleanups', 'Advocacy events'],
        followed: true,
      },
      {
        name: 'Youth Mentorship Program',
        type: 'nonprofit',
        description: 'Connecting at-risk youth with positive adult role models',
        website: 'https://example.org/ymp',
        serviceLink: 'https://example.org/ymp/mentor',
        opportunities: ['Weekly mentoring sessions', 'Group activities', 'Career guidance'],
        followed: false,
      },
      {
        name: 'Homeless Outreach Initiative',
        type: 'cause',
        description: 'Supporting homeless individuals with resources and dignity',
        website: 'https://example.org/hoi',
        donationLink: 'https://example.org/hoi/give',
        opportunities: ['Care package assembly', 'Resource fairs', 'Meal service'],
        followed: true,
      },
    ];

    await Organization.insertMany(
      organizations.map(o => ({ ...o, userId }))
    );
    console.log(`[SEED] Created ${organizations.length} organizations`);
  }

  // Seed content library with 200+ items
  const existingContent = await ContentLibraryItem.countDocuments();
  if (existingContent === 0) {
    await seedContentLibrary();
  }

  console.log('[SEED] Database seed complete');
}

async function seedContentLibrary(): Promise<void> {
  const innerCircleIdeas = getInnerCircleIdeas();
  const communityIdeas = getCommunityIdeas();

  const allItems = [...innerCircleIdeas, ...communityIdeas];
  await ContentLibraryItem.insertMany(allItems);
  console.log(`[SEED] Created ${allItems.length} content library items`);
}

function getInnerCircleIdeas() {
  return [
    // Communication & Connection (25)
    { title: 'Send a handwritten note', content: 'Write a heartfelt letter expressing gratitude or appreciation. In our digital age, a physical note carries special weight.', category: 'Communication', type: 'suggestion' as const, tags: ['gratitude', 'personal', 'thoughtful'], treeType: 'inner' as const },
    { title: 'Schedule quality time together', content: 'Plan a dedicated one-on-one activity without distractions. Put phones away and be fully present.', category: 'Connection', type: 'suggestion' as const, tags: ['time', 'presence', 'quality'], treeType: 'inner' as const },
    { title: 'Share something meaningful', content: 'Send an article, song, podcast, or memory that made you think of them. It shows they\'re on your mind.', category: 'Sharing', type: 'suggestion' as const, tags: ['thoughtful', 'personal', 'sharing'], treeType: 'inner' as const },
    { title: 'Practice active listening', content: 'Give your full attention, maintain eye contact, and reflect back what you hear. Avoid planning your response while they speak.', category: 'Communication', type: 'suggestion' as const, tags: ['listening', 'empathy', 'presence'], treeType: 'inner' as const },
    { title: 'Ask open-ended questions', content: 'Instead of "How are you?", try "What\'s bringing you joy lately?" or "What\'s been challenging recently?"', category: 'Communication', type: 'suggestion' as const, tags: ['conversation', 'curiosity', 'depth'], treeType: 'inner' as const },
    { title: 'Send a voice message', content: 'Record a spontaneous voice note sharing your thoughts or just saying hello. Hearing your voice adds warmth.', category: 'Communication', type: 'suggestion' as const, tags: ['voice', 'personal', 'spontaneous'], treeType: 'inner' as const },
    { title: 'Start a conversation journal', content: 'Create a shared document where you both can write thoughts, questions, and reflections over time.', category: 'Communication', type: 'suggestion' as const, tags: ['journaling', 'reflection', 'ongoing'], treeType: 'inner' as const },
    { title: 'Share a vulnerable moment', content: 'Open up about something you\'re struggling with. Vulnerability invites deeper connection.', category: 'Connection', type: 'suggestion' as const, tags: ['vulnerability', 'trust', 'authenticity'], treeType: 'inner' as const },
    { title: 'Express specific appreciation', content: 'Instead of "you\'re great," say "I appreciate how you always remember to ask about my mom\'s health."', category: 'Communication', type: 'suggestion' as const, tags: ['appreciation', 'specificity', 'gratitude'], treeType: 'inner' as const },
    { title: 'Create a check-in ritual', content: 'Establish a regular time for catching up—weekly calls, monthly coffee dates, or daily texts.', category: 'Tradition', type: 'suggestion' as const, tags: ['routine', 'consistency', 'ritual'], treeType: 'inner' as const },

    // Support & Care (25)
    { title: 'Offer specific help', content: 'Instead of "let me know if you need anything," offer something concrete: "Can I bring dinner Tuesday?"', category: 'Support', type: 'suggestion' as const, tags: ['support', 'practical', 'specific'], treeType: 'inner' as const },
    { title: 'Show up during tough times', content: 'When someone is grieving or struggling, don\'t wait to be asked. Just be present, even if it\'s uncomfortable.', category: 'Support', type: 'suggestion' as const, tags: ['grief', 'presence', 'difficult-times'], treeType: 'inner' as const },
    { title: 'Remember important dates', content: 'Mark birthdays, anniversaries, and difficult dates (loss of loved ones) on your calendar and reach out.', category: 'Thoughtfulness', type: 'suggestion' as const, tags: ['memory', 'care', 'dates'], treeType: 'inner' as const },
    { title: 'Celebrate small wins', content: 'Acknowledge achievements others might overlook—a completed project, a hard conversation, showing up when tired.', category: 'Encouragement', type: 'suggestion' as const, tags: ['celebration', 'positive', 'recognition'], treeType: 'inner' as const },
    { title: 'Check in after big events', content: 'Follow up after job interviews, medical appointments, or difficult conversations. The aftermath matters too.', category: 'Support', type: 'suggestion' as const, tags: ['follow-up', 'care', 'timing'], treeType: 'inner' as const },
    { title: 'Bring comfort food', content: 'When someone is sick, grieving, or overwhelmed, drop off their favorite meal or homemade soup.', category: 'Support', type: 'suggestion' as const, tags: ['food', 'comfort', 'nurturing'], treeType: 'inner' as const },
    { title: 'Offer to run errands', content: 'Pick up groceries, grab prescriptions, or handle tasks when someone is overwhelmed or unwell.', category: 'Service', type: 'suggestion' as const, tags: ['errands', 'practical', 'help'], treeType: 'inner' as const },
    { title: 'Send encouragement before challenges', content: 'Text "thinking of you" before a big presentation, surgery, or difficult day they\'ve mentioned.', category: 'Encouragement', type: 'suggestion' as const, tags: ['anticipation', 'support', 'encouragement'], treeType: 'inner' as const },
    { title: 'Validate their feelings', content: 'Say "that sounds really hard" instead of trying to fix or minimize. Sometimes people just need to be heard.', category: 'Support', type: 'suggestion' as const, tags: ['validation', 'empathy', 'listening'], treeType: 'inner' as const },
    { title: 'Create a care package', content: 'Assemble items that bring comfort: favorite snacks, cozy socks, uplifting books, self-care items.', category: 'Gift', type: 'suggestion' as const, tags: ['care-package', 'thoughtful', 'comfort'], treeType: 'inner' as const },

    // Shared Experiences (25)
    { title: 'Cook a meal together', content: 'Choose a recipe neither of you has tried and make it together. Cooking side by side creates natural conversation.', category: 'Activity', type: 'suggestion' as const, tags: ['cooking', 'shared-experience', 'fun'], treeType: 'inner' as const },
    { title: 'Take a walk and talk', content: 'Walking side by side often makes deep conversations easier than sitting face to face.', category: 'Activity', type: 'suggestion' as const, tags: ['walking', 'conversation', 'outdoors'], treeType: 'inner' as const },
    { title: 'Watch a movie together remotely', content: 'Use teleparty or similar apps to watch simultaneously while video chatting and reacting together.', category: 'Activity', type: 'suggestion' as const, tags: ['movie', 'remote', 'long-distance'], treeType: 'inner' as const },
    { title: 'Visit somewhere nostalgic', content: 'Return to a place that holds shared memories—the cafe where you met, your old school, a favorite park.', category: 'Memory', type: 'suggestion' as const, tags: ['nostalgia', 'memories', 'places'], treeType: 'inner' as const },
    { title: 'Learn something new together', content: 'Take a class, workshop, or online course together. Shared learning creates bonds and inside jokes.', category: 'Growth', type: 'suggestion' as const, tags: ['learning', 'growth', 'shared'], treeType: 'inner' as const },
    { title: 'Create a photo album together', content: 'Compile photos and memories into a physical or digital album. Reminiscing strengthens bonds.', category: 'Memory', type: 'suggestion' as const, tags: ['photos', 'memories', 'creative'], treeType: 'inner' as const },
    { title: 'Have a game night', content: 'Board games, card games, or video games create laughter and friendly competition.', category: 'Activity', type: 'suggestion' as const, tags: ['games', 'fun', 'laughter'], treeType: 'inner' as const },
    { title: 'Go on an adventure', content: 'Try something neither of you has done: hiking a new trail, visiting a nearby town, trying exotic food.', category: 'Adventure', type: 'suggestion' as const, tags: ['adventure', 'new-experiences', 'exploration'], treeType: 'inner' as const },
    { title: 'Volunteer together', content: 'Find a cause you both care about and serve side by side. Shared purpose deepens connection.', category: 'Service', type: 'suggestion' as const, tags: ['volunteering', 'purpose', 'shared-values'], treeType: 'inner' as const },
    { title: 'Create a tradition', content: 'Start something you do regularly: annual camping trip, monthly book club, weekly phone call.', category: 'Tradition', type: 'suggestion' as const, tags: ['tradition', 'routine', 'bonding'], treeType: 'inner' as const },

    // Gift Ideas & Thoughtful Gestures (25)
    { title: 'Give the gift of time', content: 'Offer babysitting, house-sitting, or taking care of pets so they can have time for themselves.', category: 'Gift', type: 'suggestion' as const, tags: ['time', 'service', 'practical'], treeType: 'inner' as const },
    { title: 'Create a personalized playlist', content: 'Curate songs that remind you of them or match their current mood. Include notes about why each song matters.', category: 'Gift', type: 'suggestion' as const, tags: ['music', 'personalized', 'creative'], treeType: 'inner' as const },
    { title: 'Frame a meaningful photo', content: 'Print and frame a photo of you together or a place that matters to them.', category: 'Gift', type: 'suggestion' as const, tags: ['photo', 'gift', 'memories'], treeType: 'inner' as const },
    { title: 'Give a book with a note', content: 'Choose a book that made you think of them and write why inside the cover.', category: 'Gift', type: 'suggestion' as const, tags: ['books', 'reading', 'thoughtful'], treeType: 'inner' as const },
    { title: 'Surprise them with their favorite treat', content: 'Drop off their favorite coffee, pastry, or snack unexpectedly. Small surprises brighten days.', category: 'Gift', type: 'suggestion' as const, tags: ['surprise', 'treats', 'small-gestures'], treeType: 'inner' as const },
    { title: 'Write a list of reasons you appreciate them', content: 'Create a numbered list of specific things you love or admire about them.', category: 'Gift', type: 'suggestion' as const, tags: ['appreciation', 'list', 'heartfelt'], treeType: 'inner' as const },
    { title: 'Make something by hand', content: 'Knit, bake, build, or craft something. Imperfect handmade gifts carry more meaning than perfect store-bought ones.', category: 'Gift', type: 'suggestion' as const, tags: ['handmade', 'creative', 'effort'], treeType: 'inner' as const },
    { title: 'Gift an experience', content: 'Concert tickets, cooking class, spa day, or museum membership—experiences create lasting memories.', category: 'Gift', type: 'suggestion' as const, tags: ['experience', 'memories', 'events'], treeType: 'inner' as const },
    { title: 'Donate to their favorite cause', content: 'Make a donation in their name to an organization they care about.', category: 'Gift', type: 'suggestion' as const, tags: ['donation', 'charity', 'meaningful'], treeType: 'inner' as const },
    { title: 'Create a memory jar', content: 'Fill a jar with notes recalling shared memories, inside jokes, and things you appreciate about them.', category: 'Gift', type: 'suggestion' as const, tags: ['memories', 'creative', 'keepsake'], treeType: 'inner' as const },

    // Conflict Resolution & Repair (10)
    { title: 'Apologize sincerely', content: 'Say "I\'m sorry for [specific action]. I understand it hurt you because [acknowledge impact]. Here\'s what I\'ll do differently."', category: 'Repair', type: 'suggestion' as const, tags: ['apology', 'accountability', 'repair'], treeType: 'inner' as const },
    { title: 'Listen without defending', content: 'When someone shares how you hurt them, resist explaining or justifying. Just listen and validate.', category: 'Communication', type: 'suggestion' as const, tags: ['listening', 'humility', 'repair'], treeType: 'inner' as const },
    { title: 'Ask how to make it right', content: 'After apologizing, ask "What would help rebuild trust?" Then follow through on their answer.', category: 'Repair', type: 'suggestion' as const, tags: ['restoration', 'trust', 'action'], treeType: 'inner' as const },
    { title: 'Give space when needed', content: 'Sometimes the most loving thing is to step back and let them process. Respect their timeline.', category: 'Boundaries', type: 'suggestion' as const, tags: ['space', 'respect', 'patience'], treeType: 'inner' as const },
    { title: 'Own your part', content: 'Even if conflict was mutual, focus on your contribution. "I could have handled that better" opens doors.', category: 'Repair', type: 'suggestion' as const, tags: ['ownership', 'humility', 'growth'], treeType: 'inner' as const },
    { title: 'Seek to understand first', content: 'Before being understood, try to understand. Ask questions with genuine curiosity, not interrogation.', category: 'Communication', type: 'suggestion' as const, tags: ['understanding', 'curiosity', 'empathy'], treeType: 'inner' as const },
    { title: 'Express feelings without blame', content: 'Use "I felt..." statements instead of "You always..." Focus on your experience, not accusations.', category: 'Communication', type: 'suggestion' as const, tags: ['communication', 'feelings', 'nonviolent'], treeType: 'inner' as const },
    { title: 'Forgive gradually', content: 'Forgiveness is a process, not an event. Be patient with yourself and acknowledge progress.', category: 'Healing', type: 'suggestion' as const, tags: ['forgiveness', 'patience', 'healing'], treeType: 'inner' as const },
    { title: 'Rebuild trust through consistency', content: 'Trust is rebuilt through repeated reliable actions over time. Show up when you say you will.', category: 'Repair', type: 'suggestion' as const, tags: ['trust', 'consistency', 'reliability'], treeType: 'inner' as const },
    { title: 'Consider mediation', content: 'For deep conflicts, a neutral third party can help facilitate understanding and resolution.', category: 'Repair', type: 'suggestion' as const, tags: ['mediation', 'professional-help', 'resolution'], treeType: 'inner' as const },

    // Milestone Celebrations (15)
    { title: 'Celebrate work anniversaries', content: 'Acknowledge career milestones with a thoughtful note or small celebration.', category: 'Celebration', type: 'suggestion' as const, tags: ['work', 'milestone', 'recognition'], treeType: 'inner' as const },
    { title: 'Mark sobriety anniversaries', content: 'Recognize recovery milestones with support and acknowledgment of their journey.', category: 'Celebration', type: 'suggestion' as const, tags: ['recovery', 'support', 'milestone'], treeType: 'inner' as const },
    { title: 'Celebrate firsts', content: 'First job, first apartment, first child—acknowledge life transitions with enthusiasm.', category: 'Celebration', type: 'suggestion' as const, tags: ['firsts', 'transitions', 'joy'], treeType: 'inner' as const },
    { title: 'Honor retirement', content: 'Plan a meaningful send-off that celebrates their career and future adventures.', category: 'Celebration', type: 'suggestion' as const, tags: ['retirement', 'career', 'transition'], treeType: 'inner' as const },
    { title: 'Commemorate loss anniversaries', content: 'Reach out on difficult dates—the anniversary of a loved one\'s passing can be especially hard.', category: 'Support', type: 'suggestion' as const, tags: ['grief', 'remembrance', 'support'], treeType: 'inner' as const },
    { title: 'Celebrate personal growth', content: 'Acknowledge when someone completes therapy, overcomes a fear, or breaks a bad habit.', category: 'Encouragement', type: 'suggestion' as const, tags: ['growth', 'personal-development', 'achievement'], treeType: 'inner' as const },
    { title: 'Mark friendship anniversaries', content: 'Celebrate how long you\'ve known each other with nostalgia and gratitude.', category: 'Tradition', type: 'suggestion' as const, tags: ['friendship', 'anniversary', 'gratitude'], treeType: 'inner' as const },
    { title: 'Congratulate educational achievements', content: 'Graduations, certifications, degrees—celebrate learning accomplishments enthusiastically.', category: 'Celebration', type: 'suggestion' as const, tags: ['education', 'graduation', 'achievement'], treeType: 'inner' as const },
    { title: 'Acknowledge parenting wins', content: 'Notice and praise good parenting moments—they often go unrecognized.', category: 'Encouragement', type: 'suggestion' as const, tags: ['parenting', 'recognition', 'support'], treeType: 'inner' as const },
    { title: 'Celebrate health victories', content: 'Recovery from illness, completing treatment, reaching fitness goals deserve recognition.', category: 'Celebration', type: 'suggestion' as const, tags: ['health', 'recovery', 'wellness'], treeType: 'inner' as const },
    { title: 'Host a surprise celebration', content: 'Organize friends and family for a surprise party or gathering for a special occasion.', category: 'Celebration', type: 'suggestion' as const, tags: ['surprise', 'party', 'gathering'], treeType: 'inner' as const },
    { title: 'Create a milestone scrapbook', content: 'Compile photos and memories marking an important life transition or achievement.', category: 'Gift', type: 'suggestion' as const, tags: ['scrapbook', 'memories', 'creative'], treeType: 'inner' as const },
    { title: 'Write a tribute letter', content: 'Compose a detailed letter honoring their character, impact, and importance in your life.', category: 'Communication', type: 'suggestion' as const, tags: ['tribute', 'honor', 'heartfelt'], treeType: 'inner' as const },
    { title: 'Toast their success', content: 'Raise a glass (literally or figuratively) to acknowledge their accomplishment publicly.', category: 'Celebration', type: 'suggestion' as const, tags: ['toast', 'public-recognition', 'celebration'], treeType: 'inner' as const },
    { title: 'Give a symbolic gift', content: 'Choose something that represents the milestone—a compass for new directions, seeds for growth.', category: 'Gift', type: 'suggestion' as const, tags: ['symbolic', 'meaningful', 'gift'], treeType: 'inner' as const },

    // Digital Connection (15)
    { title: 'Share memes that remind you of them', content: 'Send funny content that matches their humor—it says "I know you" without words.', category: 'Connection', type: 'suggestion' as const, tags: ['humor', 'digital', 'casual'], treeType: 'inner' as const },
    { title: 'Start a shared streaming watchlist', content: 'Create a list of shows or movies to watch separately and discuss together.', category: 'Activity', type: 'suggestion' as const, tags: ['streaming', 'entertainment', 'shared'], treeType: 'inner' as const },
    { title: 'Send digital postcards', content: 'Use apps to send virtual postcards from places you visit or just to say hello.', category: 'Communication', type: 'suggestion' as const, tags: ['digital', 'postcard', 'travel'], treeType: 'inner' as const },
    { title: 'Play online games together', content: 'Multiplayer games create shared experiences even when miles apart.', category: 'Activity', type: 'suggestion' as const, tags: ['gaming', 'online', 'fun'], treeType: 'inner' as const },
    { title: 'Share podcast recommendations', content: 'Exchange episodes that made you think, laugh, or learn something new.', category: 'Sharing', type: 'suggestion' as const, tags: ['podcast', 'audio', 'learning'], treeType: 'inner' as const },
    { title: 'Create a private social media group', content: 'A dedicated space for sharing updates, photos, and inside jokes with close friends.', category: 'Connection', type: 'suggestion' as const, tags: ['social-media', 'private', 'community'], treeType: 'inner' as const },
    { title: 'Video call during daily routines', content: 'Cook, clean, or commute "together" via video chat for casual companionship.', category: 'Connection', type: 'suggestion' as const, tags: ['video-call', 'routine', 'presence'], treeType: 'inner' as const },
    { title: 'Send encouraging GIFs', content: 'Sometimes a perfectly timed GIF says more than words could.', category: 'Communication', type: 'suggestion' as const, tags: ['GIF', 'encouragement', 'quick'], treeType: 'inner' as const },
    { title: 'Collaborate on a playlist', content: 'Build a shared Spotify or Apple Music playlist that grows over time.', category: 'Activity', type: 'suggestion' as const, tags: ['music', 'collaborative', 'ongoing'], treeType: 'inner' as const },
    { title: 'Share articles with personal notes', content: 'Don\'t just forward links—add why it made you think of them.', category: 'Sharing', type: 'suggestion' as const, tags: ['articles', 'personal-touch', 'thoughtful'], treeType: 'inner' as const },
    { title: 'Take an online quiz together', content: 'Personality tests, trivia, or compatibility quizzes spark fun conversations.', category: 'Activity', type: 'suggestion' as const, tags: ['quiz', 'fun', 'conversation-starter'], treeType: 'inner' as const },
    { title: 'Send sunrise or sunset photos', content: 'Share beautiful moments from your day—a simple way to say "wish you were here."', category: 'Sharing', type: 'suggestion' as const, tags: ['photos', 'nature', 'beauty'], treeType: 'inner' as const },
    { title: 'Record video messages for special occasions', content: 'A recorded birthday wish or congratulatory message they can keep forever.', category: 'Gift', type: 'suggestion' as const, tags: ['video', 'keepsake', 'special-occasion'], treeType: 'inner' as const },
    { title: 'Start a two-person book club', content: 'Read the same book and discuss via text or voice notes as you go.', category: 'Activity', type: 'suggestion' as const, tags: ['reading', 'discussion', 'intellectual'], treeType: 'inner' as const },
    { title: 'Share your location during travels', content: 'Let them follow your journey in real-time—it makes them feel included.', category: 'Connection', type: 'suggestion' as const, tags: ['travel', 'sharing', 'real-time'], treeType: 'inner' as const },

    // Emotional Support Deepening (15)
    { title: 'Ask about their dreams', content: '"What are you hoping for right now?" opens doors to deeper conversation.', category: 'Communication', type: 'suggestion' as const, tags: ['dreams', 'aspirations', 'depth'], treeType: 'inner' as const },
    { title: 'Check in on their mental health', content: 'Ask directly: "How are you really doing?" Create space for honest answers.', category: 'Support', type: 'suggestion' as const, tags: ['mental-health', 'direct', 'care'], treeType: 'inner' as const },
    { title: 'Hold space without fixing', content: 'Resist offering solutions. Sometimes presence matters more than advice.', category: 'Support', type: 'suggestion' as const, tags: ['presence', 'listening', 'non-fixing'], treeType: 'inner' as const },
    { title: 'Validate before advising', content: 'Say "that makes sense" before offering perspective. Validation builds trust.', category: 'Communication', type: 'suggestion' as const, tags: ['validation', 'trust', 'empathy'], treeType: 'inner' as const },
    { title: 'Remember details they share', content: 'Follow up on specific things they mentioned—it shows you truly listen.', category: 'Communication', type: 'suggestion' as const, tags: ['attention', 'details', 'listening'], treeType: 'inner' as const },
    { title: 'Offer unconditional positive regard', content: 'Accept them fully, even when you disagree. Love isn\'t conditional on agreement.', category: 'Connection', type: 'suggestion' as const, tags: ['acceptance', 'unconditional', 'love'], treeType: 'inner' as const },
    { title: 'Be comfortable with silence', content: 'Not every moment needs filling. Comfortable silence is intimate.', category: 'Connection', type: 'suggestion' as const, tags: ['silence', 'comfort', 'intimacy'], treeType: 'inner' as const },
    { title: 'Mirror their emotions', content: 'Match their energy—excitement deserves excitement, sadness deserves gentleness.', category: 'Communication', type: 'suggestion' as const, tags: ['mirroring', 'empathy', 'attunement'], treeType: 'inner' as const },
    { title: 'Ask permission before giving advice', content: '"Would you like my thoughts, or do you just need to vent?" respects their autonomy.', category: 'Communication', type: 'suggestion' as const, tags: ['permission', 'respect', 'autonomy'], treeType: 'inner' as const },
    { title: 'Normalize their struggles', content: '"Anyone would feel that way" reduces shame and isolation.', category: 'Support', type: 'suggestion' as const, tags: ['normalization', 'shame-reduction', 'support'], treeType: 'inner' as const },
    { title: 'Share your own struggles appropriately', content: 'Vulnerability invites vulnerability—but keep focus on their needs.', category: 'Connection', type: 'suggestion' as const, tags: ['vulnerability', 'reciprocity', 'balance'], treeType: 'inner' as const },
    { title: 'Affirm their strengths', content: 'Point out qualities they may not see in themselves during difficult times.', category: 'Encouragement', type: 'suggestion' as const, tags: ['strengths', 'affirmation', 'perspective'], treeType: 'inner' as const },
    { title: 'Help them identify feelings', content: 'Sometimes people need help naming what they\'re experiencing.', category: 'Support', type: 'suggestion' as const, tags: ['emotions', 'identification', 'clarity'], treeType: 'inner' as const },
    { title: 'Remind them of past resilience', content: '"You\'ve gotten through hard things before" reinforces their capability.', category: 'Encouragement', type: 'suggestion' as const, tags: ['resilience', 'history', 'confidence'], treeType: 'inner' as const },
    { title: 'Express confidence in their decisions', content: 'Trust their judgment even when you might choose differently.', category: 'Support', type: 'suggestion' as const, tags: ['trust', 'autonomy', 'confidence'], treeType: 'inner' as const },
  ];
}

function getCommunityIdeas() {
  return [
    // Food & Nourishment (20)
    { title: 'Organize a community meal', content: 'Host a potluck or cook-for-others event where neighbors share food and conversation.', category: 'Community Building', type: 'initiative' as const, tags: ['food', 'gathering', 'neighbors'], treeType: 'community' as const },
    { title: 'Start a meal train', content: 'Coordinate home-cooked meals for families going through illness, new babies, or loss.', category: 'Support', type: 'initiative' as const, tags: ['meals', 'families', 'crisis-support'], treeType: 'community' as const },
    { title: 'Host a community garden', content: 'Transform unused space into a shared growing area where neighbors grow food together.', category: 'Environment', type: 'initiative' as const, tags: ['gardening', 'sustainability', 'food'], treeType: 'community' as const },
    { title: 'Organize a food drive', content: 'Collect non-perishable items for local food banks. Set up collection points at schools or workplaces.', category: 'Support', type: 'initiative' as const, tags: ['food-drive', 'hunger', 'collection'], treeType: 'community' as const },
    { title: 'Create a community fridge', content: 'Set up a publicly accessible refrigerator where anyone can leave or take food freely.', category: 'Support', type: 'initiative' as const, tags: ['mutual-aid', 'food-security', 'accessibility'], treeType: 'community' as const },
    { title: 'Host a bake sale for a cause', content: 'Bake goods and sell them to raise funds for a local family in need or community project.', category: 'Fundraising', type: 'initiative' as const, tags: ['baking', 'fundraising', 'community'], treeType: 'community' as const },
    { title: 'Teach cooking classes', content: 'Share your culinary skills with neighbors who want to learn. Focus on budget-friendly, healthy meals.', category: 'Education', type: 'initiative' as const, tags: ['cooking', 'skills', 'health'], treeType: 'community' as const },
    { title: 'Organize a cultural food festival', content: 'Celebrate diversity by having neighbors share dishes from their cultural backgrounds.', category: 'Community Building', type: 'initiative' as const, tags: ['culture', 'diversity', 'celebration'], treeType: 'community' as const },
    { title: 'Start a coffee chat group', content: 'Meet weekly at a local cafe for casual conversation and connection among neighbors.', category: 'Community Building', type: 'initiative' as const, tags: ['coffee', 'conversation', 'regular'], treeType: 'community' as const },
    { title: 'Deliver meals to seniors', content: 'Partner with Meals on Wheels or organize independent delivery to elderly neighbors.', category: 'Support', type: 'initiative' as const, tags: ['seniors', 'delivery', 'care'], treeType: 'community' as const },

    // Environment & Beautification (20)
    { title: 'Organize a neighborhood cleanup', content: 'Gather volunteers to pick up litter, remove graffiti, and beautify shared spaces.', category: 'Environment', type: 'initiative' as const, tags: ['cleanup', 'beautification', 'volunteers'], treeType: 'community' as const },
    { title: 'Plant trees together', content: 'Work with local arborists to plant trees in parks, along streets, or in yards of those who need shade.', category: 'Environment', type: 'initiative' as const, tags: ['trees', 'planting', 'climate'], treeType: 'community' as const },
    { title: 'Create a pollinator garden', content: 'Plant native flowers that support bees and butterflies. Educate neighbors about pollinator importance.', category: 'Environment', type: 'initiative' as const, tags: ['pollinators', 'native-plants', 'ecology'], treeType: 'community' as const },
    { title: 'Start a tool library', content: 'Create a lending system where neighbors can borrow tools instead of everyone owning everything.', category: 'Sustainability', type: 'initiative' as const, tags: ['sharing-economy', 'tools', 'resource-sharing'], treeType: 'community' as const },
    { title: 'Organize a clothing swap', content: 'Reduce waste while helping neighbors refresh their wardrobes. Host at a community center.', category: 'Sustainability', type: 'initiative' as const, tags: ['clothing', 'sustainability', 'swap'], treeType: 'community' as const },
    { title: 'Set up a free little library', content: 'Install a weatherproof book exchange box where anyone can take or leave books freely.', category: 'Education', type: 'initiative' as const, tags: ['books', 'literacy', 'free'], treeType: 'community' as const },
    { title: 'Create murals together', content: 'Commission or paint community murals that reflect neighborhood identity and hopes.', category: 'Arts', type: 'initiative' as const, tags: ['murals', 'art', 'beautification'], treeType: 'community' as const },
    { title: 'Build birdhouses or bat boxes', content: 'Construct wildlife habitats and install them in parks or willing residents\' yards.', category: 'Environment', type: 'initiative' as const, tags: ['wildlife', 'habitat', 'building'], treeType: 'community' as const },
    { title: 'Organize a river or beach cleanup', content: 'Focus on waterway restoration by removing trash from local rivers, creeks, or beaches.', category: 'Environment', type: 'initiative' as const, tags: ['waterways', 'cleanup', 'nature'], treeType: 'community' as const },
    { title: 'Start composting program', content: 'Set up community compost bins and teach neighbors how to reduce food waste.', category: 'Sustainability', type: 'initiative' as const, tags: ['composting', 'waste-reduction', 'soil'], treeType: 'community' as const },

    // Education & Skill Sharing (20)
    { title: 'Host a skill-share workshop', content: 'Invite neighbors to teach skills they have: knitting, coding, carpentry, language lessons.', category: 'Education', type: 'initiative' as const, tags: ['skills', 'teaching', 'exchange'], treeType: 'community' as const },
    { title: 'Start a tutoring program', content: 'Connect students who need help with adults who can tutor in various subjects.', category: 'Education', type: 'initiative' as const, tags: ['tutoring', 'students', 'academic'], treeType: 'community' as const },
    { title: 'Organize financial literacy workshops', content: 'Teach budgeting, saving, investing, and debt management to neighbors of all ages.', category: 'Education', type: 'initiative' as const, tags: ['finance', 'literacy', 'empowerment'], treeType: 'community' as const },
    { title: 'Create a mentorship program', content: 'Pair experienced professionals with young people exploring career paths.', category: 'Mentorship', type: 'initiative' as const, tags: ['mentorship', 'career', 'youth'], treeType: 'community' as const },
    { title: 'Host computer skills classes', content: 'Help seniors or newcomers learn basic computer skills, email, and internet safety.', category: 'Education', type: 'initiative' as const, tags: ['technology', 'digital-literacy', 'seniors'], treeType: 'community' as const },
    { title: 'Start a book club', content: 'Read and discuss books together monthly. Choose diverse voices and perspectives.', category: 'Education', type: 'initiative' as const, tags: ['books', 'discussion', 'reading'], treeType: 'community' as const },
    { title: 'Teach first aid and CPR', content: 'Organize certified training sessions so more neighbors can respond in emergencies.', category: 'Safety', type: 'initiative' as const, tags: ['first-aid', 'CPR', 'emergency'], treeType: 'community' as const },
    { title: 'Host resume workshops', content: 'Help job seekers craft strong resumes and practice interview skills.', category: 'Education', type: 'initiative' as const, tags: ['jobs', 'resumes', 'career'], treeType: 'community' as const },
    { title: 'Create a language exchange', content: 'Pair native speakers of different languages for mutual learning and cultural exchange.', category: 'Education', type: 'initiative' as const, tags: ['language', 'culture', 'exchange'], treeType: 'community' as const },
    { title: 'Organize STEM activities for kids', content: 'Host science experiments, coding clubs, or robotics workshops for young learners.', category: 'Education', type: 'initiative' as const, tags: ['STEM', 'kids', 'science'], treeType: 'community' as const },

    // Support & Mutual Aid (20)
    { title: 'Create care packages for homeless', content: 'Assemble hygiene kits, warm socks, snacks, and resource lists for unhoused neighbors.', category: 'Support', type: 'initiative' as const, tags: ['homelessness', 'care-packages', 'compassion'], treeType: 'community' as const },
    { title: 'Organize a tip night', content: 'Pool resources to generously tip service workers at local restaurants during slow seasons.', category: 'Support', type: 'initiative' as const, tags: ['tips', 'service-workers', 'generosity'], treeType: 'community' as const },
    { title: 'Start a neighborhood watch (caring version)', content: 'Check in on elderly or vulnerable neighbors regularly. Not surveillance—care.', category: 'Support', type: 'initiative' as const, tags: ['check-ins', 'elderly', 'care-network'], treeType: 'community' as const },
    { title: 'Host a winter coat drive', content: 'Collect warm coats, hats, and gloves for those who cannot afford them.', category: 'Support', type: 'initiative' as const, tags: ['winter', 'clothing', 'warmth'], treeType: 'community' as const },
    { title: 'Create a babysitting co-op', content: 'Parents take turns watching each other\'s children, giving everyone breaks.', category: 'Support', type: 'initiative' as const, tags: ['childcare', 'parents', 'cooperation'], treeType: 'community' as const },
    { title: 'Organize a moving help crew', content: 'Volunteer to help neighbors move furniture, especially elderly or disabled residents.', category: 'Support', type: 'initiative' as const, tags: ['moving', 'physical-help', 'neighbors'], treeType: 'community' as const },
    { title: 'Start a pet care network', content: 'Neighbors help walk dogs, feed cats, or provide pet sitting for each other.', category: 'Support', type: 'initiative' as const, tags: ['pets', 'animals', 'mutual-aid'], treeType: 'community' as const },
    { title: 'Host a mental health awareness event', content: 'Invite speakers, share resources, and reduce stigma around mental health struggles.', category: 'Health', type: 'initiative' as const, tags: ['mental-health', 'awareness', 'support'], treeType: 'community' as const },
    { title: 'Create emergency preparedness kits', content: 'Assemble and distribute kits with essentials for power outages, storms, or disasters.', category: 'Safety', type: 'initiative' as const, tags: ['emergency', 'preparedness', 'safety'], treeType: 'community' as const },
    { title: 'Start a ride-share network', content: 'Help neighbors without cars get to appointments, grocery stores, or work.', category: 'Support', type: 'initiative' as const, tags: ['transportation', 'mobility', 'access'], treeType: 'community' as const },

    // Social & Celebration (20)
    { title: 'Host a block party', content: 'Close the street, set up grills and games, and invite everyone to connect.', category: 'Community Building', type: 'initiative' as const, tags: ['party', 'social', 'fun'], treeType: 'community' as const },
    { title: 'Organize a talent show', content: 'Showcase local musicians, dancers, comedians, and artists. Celebrate hidden talents.', category: 'Arts', type: 'initiative' as const, tags: ['talent', 'performance', 'celebration'], treeType: 'community' as const },
    { title: 'Host a movie night in the park', content: 'Set up a projector outdoors and watch family-friendly films under the stars.', category: 'Entertainment', type: 'initiative' as const, tags: ['movies', 'outdoor', 'family'], treeType: 'community' as const },
    { title: 'Create a welcome wagon', content: 'Greet new neighbors with baked goods, local info, and friendly faces.', category: 'Community Building', type: 'initiative' as const, tags: ['welcome', 'new-neighbors', 'hospitality'], treeType: 'community' as const },
    { title: 'Organize a holiday celebration', content: 'Host seasonal gatherings: pumpkin carving, cookie exchange, caroling, or Easter egg hunts.', category: 'Celebration', type: 'initiative' as const, tags: ['holidays', 'seasonal', 'traditions'], treeType: 'community' as const },
    { title: 'Start a walking group', content: 'Meet regularly for walks around the neighborhood. Exercise and conversation combined.', category: 'Health', type: 'initiative' as const, tags: ['walking', 'exercise', 'social'], treeType: 'community' as const },
    { title: 'Host a game tournament', content: 'Organize board game, card game, or video game competitions with prizes.', category: 'Entertainment', type: 'initiative' as const, tags: ['games', 'competition', 'fun'], treeType: 'community' as const },
    { title: 'Create a community newsletter', content: 'Share news, events, spotlights on neighbors, and resources via print or email.', category: 'Communication', type: 'initiative' as const, tags: ['newsletter', 'information', 'connection'], treeType: 'community' as const },
    { title: 'Organize a cultural celebration', content: 'Celebrate heritage months, international holidays, or cultural traditions represented in your area.', category: 'Celebration', type: 'initiative' as const, tags: ['culture', 'diversity', 'heritage'], treeType: 'community' as const },
    { title: 'Host a gratitude gathering', content: 'Invite neighbors to share what they\'re thankful for. Create a collective gratitude wall.', category: 'Community Building', type: 'initiative' as const, tags: ['gratitude', 'thanksgiving', 'positivity'], treeType: 'community' as const },

    // Health & Wellness (15)
    { title: 'Organize a community yoga session', content: 'Host free outdoor yoga in a park for all skill levels.', category: 'Health', type: 'initiative' as const, tags: ['yoga', 'fitness', 'outdoor'], treeType: 'community' as const },
    { title: 'Start a meditation group', content: 'Meet weekly for guided or silent meditation practice.', category: 'Health', type: 'initiative' as const, tags: ['meditation', 'mindfulness', 'peace'], treeType: 'community' as const },
    { title: 'Host a health fair', content: 'Partner with local clinics for free screenings and health information.', category: 'Health', type: 'initiative' as const, tags: ['health-screening', 'wellness', 'prevention'], treeType: 'community' as const },
    { title: 'Create a community sports league', content: 'Organize recreational teams for soccer, basketball, or softball.', category: 'Health', type: 'initiative' as const, tags: ['sports', 'recreation', 'teamwork'], treeType: 'community' as const },
    { title: 'Start a running club', content: 'Meet regularly for group runs at various paces.', category: 'Health', type: 'initiative' as const, tags: ['running', 'exercise', 'social'], treeType: 'community' as const },
    { title: 'Host nutrition workshops', content: 'Teach healthy eating habits and meal planning on a budget.', category: 'Health', type: 'initiative' as const, tags: ['nutrition', 'cooking', 'health'], treeType: 'community' as const },
    { title: 'Organize a mental health support group', content: 'Create safe space for sharing struggles and coping strategies.', category: 'Health', type: 'initiative' as const, tags: ['mental-health', 'support-group', 'healing'], treeType: 'community' as const },
    { title: 'Start a community garden therapy program', content: 'Use gardening as therapeutic activity for stress relief.', category: 'Health', type: 'initiative' as const, tags: ['gardening', 'therapy', 'nature'], treeType: 'community' as const },
    { title: 'Host self-defense classes', content: 'Empower community members with personal safety skills.', category: 'Safety', type: 'initiative' as const, tags: ['self-defense', 'empowerment', 'safety'], treeType: 'community' as const },
    { title: 'Create a senior exercise program', content: 'Gentle movement classes designed for older adults.', category: 'Health', type: 'initiative' as const, tags: ['seniors', 'exercise', 'mobility'], treeType: 'community' as const },
    { title: 'Organize a stress management workshop', content: 'Teach practical techniques for handling daily pressures.', category: 'Health', type: 'initiative' as const, tags: ['stress', 'coping', 'wellness'], treeType: 'community' as const },
    { title: 'Start a sleep hygiene education series', content: 'Help neighbors improve their rest through better habits.', category: 'Health', type: 'initiative' as const, tags: ['sleep', 'education', 'rest'], treeType: 'community' as const },
    { title: 'Host a substance-free social event', content: 'Provide fun alternatives to alcohol-centered gatherings.', category: 'Health', type: 'initiative' as const, tags: ['sober', 'social', 'alternatives'], treeType: 'community' as const },
    { title: 'Create a grief support network', content: 'Connect people experiencing loss with others who understand.', category: 'Support', type: 'initiative' as const, tags: ['grief', 'loss', 'support'], treeType: 'community' as const },
    { title: 'Organize disability inclusion activities', content: 'Ensure community events are accessible to all abilities.', category: 'Community Building', type: 'initiative' as const, tags: ['inclusion', 'accessibility', 'disability'], treeType: 'community' as const },

    // Arts & Culture (15)
    { title: 'Host an open mic night', content: 'Create stage for poets, musicians, storytellers, and comedians.', category: 'Arts', type: 'initiative' as const, tags: ['performance', 'open-mic', 'creative-expression'], treeType: 'community' as const },
    { title: 'Start a community choir', content: 'Sing together regardless of experience level—joy matters more than perfection.', category: 'Arts', type: 'initiative' as const, tags: ['music', 'singing', 'group'], treeType: 'community' as const },
    { title: 'Organize a photography walk', content: 'Explore the neighborhood through cameras, sharing perspectives.', category: 'Arts', type: 'initiative' as const, tags: ['photography', 'exploration', 'creative'], treeType: 'community' as const },
    { title: 'Host craft workshops', content: 'Teach knitting, pottery, painting, or other hands-on arts.', category: 'Arts', type: 'initiative' as const, tags: ['crafts', 'hands-on', 'learning'], treeType: 'community' as const },
    { title: 'Create a community art installation', content: 'Collaborate on a sculpture, mosaic, or interactive piece.', category: 'Arts', type: 'initiative' as const, tags: ['installation', 'collaboration', 'public-art'], treeType: 'community' as const },
    { title: 'Start a storytelling circle', content: 'Share personal stories in a supportive, listening environment.', category: 'Arts', type: 'initiative' as const, tags: ['storytelling', 'sharing', 'oral-tradition'], treeType: 'community' as const },
    { title: 'Host a dance party', content: 'Play music and move together—no skill required, just enthusiasm.', category: 'Arts', type: 'initiative' as const, tags: ['dance', 'music', 'movement'], treeType: 'community' as const },
    { title: 'Organize a writing group', content: 'Write together, share work, and offer constructive feedback.', category: 'Arts', type: 'initiative' as const, tags: ['writing', 'feedback', 'creative'], treeType: 'community' as const },
    { title: 'Create a zine-making workshop', content: 'Make small publications expressing community voices.', category: 'Arts', type: 'initiative' as const, tags: ['zine', 'publishing', 'DIY'], treeType: 'community' as const },
    { title: 'Host a film screening and discussion', content: 'Watch meaningful movies together and talk about themes.', category: 'Arts', type: 'initiative' as const, tags: ['film', 'discussion', 'cinema'], treeType: 'community' as const },
    { title: 'Start a drumming circle', content: 'Rhythm connects people across cultures and ages.', category: 'Arts', type: 'initiative' as const, tags: ['drumming', 'rhythm', 'music'], treeType: 'community' as const },
    { title: 'Organize a poetry slam', content: 'Competitive poetry performance celebrating spoken word.', category: 'Arts', type: 'initiative' as const, tags: ['poetry', 'performance', 'competition'], treeType: 'community' as const },
    { title: 'Host a cultural exchange dinner', content: 'Families share traditional dishes and stories from their heritage.', category: 'Celebration', type: 'initiative' as const, tags: ['culture', 'food', 'exchange'], treeType: 'community' as const },
    { title: 'Create a community podcast', content: 'Record interviews and stories highlighting local voices.', category: 'Arts', type: 'initiative' as const, tags: ['podcast', 'audio', 'storytelling'], treeType: 'community' as const },
    { title: 'Organize a street art festival', content: 'Celebrate graffiti, murals, chalk art, and urban creativity.', category: 'Arts', type: 'initiative' as const, tags: ['street-art', 'festival', 'urban'], treeType: 'community' as const },

    // Civic Engagement (15)
    { title: 'Host a voter registration drive', content: 'Help neighbors register and learn about upcoming elections.', category: 'Civic', type: 'initiative' as const, tags: ['voting', 'democracy', 'engagement'], treeType: 'community' as const },
    { title: 'Organize a town hall meeting', content: 'Create forum for discussing local issues and solutions.', category: 'Civic', type: 'initiative' as const, tags: ['town-hall', 'discussion', 'local-government'], treeType: 'community' as const },
    { title: 'Start a community advocacy group', content: 'Mobilize around issues like housing, transit, or environmental justice.', category: 'Civic', type: 'initiative' as const, tags: ['advocacy', 'activism', 'change'], treeType: 'community' as const },
    { title: 'Host a know-your-rights workshop', content: 'Educate neighbors about legal rights and resources.', category: 'Civic', type: 'initiative' as const, tags: ['legal', 'rights', 'education'], treeType: 'community' as const },
    { title: 'Create a neighborhood association', content: 'Formalize structure for addressing shared concerns.', category: 'Civic', type: 'initiative' as const, tags: ['organization', 'governance', 'representation'], treeType: 'community' as const },
    { title: 'Organize a letter-writing campaign', content: 'Collectively write to officials about important issues.', category: 'Civic', type: 'initiative' as const, tags: ['letters', 'advocacy', 'political'], treeType: 'community' as const },
    { title: 'Host a candidate forum', content: 'Invite political candidates to meet voters and answer questions.', category: 'Civic', type: 'initiative' as const, tags: ['politics', 'candidates', 'forum'], treeType: 'community' as const },
    { title: 'Start a civic education series', content: 'Teach how local government works and how to participate.', category: 'Civic', type: 'initiative' as const, tags: ['education', 'government', 'participation'], treeType: 'community' as const },
    { title: 'Organize a community survey', content: 'Gather input on what neighbors want and need.', category: 'Civic', type: 'initiative' as const, tags: ['survey', 'input', 'data'], treeType: 'community' as const },
    { title: 'Host a budget participatory meeting', content: 'Let residents decide how to spend part of public funds.', category: 'Civic', type: 'initiative' as const, tags: ['budget', 'participatory', 'decision-making'], treeType: 'community' as const },
    { title: 'Create a community oversight committee', content: 'Monitor local institutions and advocate for accountability.', category: 'Civic', type: 'initiative' as const, tags: ['oversight', 'accountability', 'monitoring'], treeType: 'community' as const },
    { title: 'Organize a petition drive', content: 'Collect signatures for causes the community supports.', category: 'Civic', type: 'initiative' as const, tags: ['petition', 'signatures', 'advocacy'], treeType: 'community' as const },
    { title: 'Host a public comment preparation session', content: 'Help neighbors prepare testimony for government meetings.', category: 'Civic', type: 'initiative' as const, tags: ['testimony', 'public-speaking', 'preparation'], treeType: 'community' as const },
    { title: 'Start a community watchdog newsletter', content: 'Report on local issues, decisions, and hold leaders accountable.', category: 'Communication', type: 'initiative' as const, tags: ['watchdog', 'journalism', 'accountability'], treeType: 'community' as const },
    { title: 'Organize a solidarity rally', content: 'Stand together for justice, peace, or community values.', category: 'Civic', type: 'initiative' as const, tags: ['rally', 'solidarity', 'justice'], treeType: 'community' as const },

    // Intergenerational Connection (10)
    { title: 'Start a senior-youth mentorship program', content: 'Pair elders with young people for mutual learning.', category: 'Mentorship', type: 'initiative' as const, tags: ['intergenerational', 'mentorship', 'wisdom'], treeType: 'community' as const },
    { title: 'Host story-sharing sessions', content: 'Elders share life experiences; youth share fresh perspectives.', category: 'Connection', type: 'initiative' as const, tags: ['stories', 'elders', 'youth'], treeType: 'community' as const },
    { title: 'Create tech tutoring for seniors', content: 'Young people teach digital skills to older generations.', category: 'Education', type: 'initiative' as const, tags: ['technology', 'seniors', 'teaching'], treeType: 'community' as const },
    { title: 'Organize intergenerational game nights', content: 'Board games bridge age gaps through play.', category: 'Entertainment', type: 'initiative' as const, tags: ['games', 'ages', 'fun'], treeType: 'community' as const },
    { title: 'Start a legacy recording project', content: 'Document elders\' stories before they\'re lost.', category: 'Memory', type: 'initiative' as const, tags: ['legacy', 'recording', 'preservation'], treeType: 'community' as const },
    { title: 'Host cooking traditions workshops', content: 'Elders teach traditional recipes to younger generations.', category: 'Education', type: 'initiative' as const, tags: ['cooking', 'traditions', 'heritage'], treeType: 'community' as const },
    { title: 'Create a time capsule project', content: 'Generations contribute items representing their era.', category: 'Memory', type: 'initiative' as const, tags: ['time-capsule', 'history', 'future'], treeType: 'community' as const },
    { title: 'Organize pen pal exchanges', content: 'Written correspondence between different age groups.', category: 'Communication', type: 'initiative' as const, tags: ['pen-pals', 'writing', 'connection'], treeType: 'community' as const },
    { title: 'Host a skills swap across generations', content: 'Youth teach new tech; elders teach traditional crafts.', category: 'Education', type: 'initiative' as const, tags: ['skills', 'exchange', 'mutual-learning'], treeType: 'community' as const },
    { title: 'Create memory gardens with elders', content: 'Plant flowers that evoke memories and stories.', category: 'Environment', type: 'initiative' as const, tags: ['gardening', 'memories', 'healing'], treeType: 'community' as const },
  ];
}

function getSampleActionTitle(index: number): string {
  const titles = [
    'Sent a thoughtful text message',
    'Scheduled a coffee catch-up',
    'Shared an encouraging article',
    'Offered to help with errands',
    'Sent birthday wishes',
    'Listened without judgment',
    'Remembered an important date',
    'Celebrated their achievement',
    'Checked in during tough times',
    'Invited them to an event',
  ];
  return titles[index % titles.length];
}
