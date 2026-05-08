// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const QUESTIONS = [
  // DSA
  {
    domain: 'DSA', difficulty: 'EASY', type: 'coding',
    question: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    idealAnswer: 'Use a hash map for O(n) time. Iterate array, check if complement exists in map, if yes return indices, else add current to map.',
    tags: ['array', 'hash-map', 'two-sum'],
  },
  {
    domain: 'DSA', difficulty: 'MEDIUM', type: 'coding',
    question: 'Given a string, find the length of the longest substring without repeating characters.',
    idealAnswer: 'Sliding window with hash set. Two pointers left/right, expand right, shrink left when duplicate found. O(n) time.',
    tags: ['string', 'sliding-window', 'hash-set'],
  },
  {
    domain: 'DSA', difficulty: 'HARD', type: 'coding',
    question: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    idealAnswer: 'Two pointer approach. Track leftMax and rightMax. Water at each position = min(leftMax, rightMax) - height[i]. O(n) time, O(1) space.',
    tags: ['array', 'two-pointer', 'dynamic-programming'],
    company: 'Amazon',
  },

  // System Design
  {
    domain: 'SYSTEM_DESIGN', difficulty: 'MEDIUM', type: 'design',
    question: 'Design a URL shortening service like bit.ly. Focus on scalability.',
    idealAnswer: 'Components: API servers, DB (PostgreSQL for mappings), Cache (Redis), CDN. Hash function: MD5 or custom base62. Handle collisions. Scale: sharding by hash, read replicas.',
    tags: ['url-shortener', 'scalability', 'hashing'],
  },
  {
    domain: 'SYSTEM_DESIGN', difficulty: 'HARD', type: 'design',
    question: 'Design a distributed message queue like Kafka. What are the key architectural decisions?',
    idealAnswer: 'Partitioned log, producers write to partition leaders, consumers track offsets. Replication for fault tolerance. Zookeeper for coordination. Retention policies.',
    tags: ['kafka', 'distributed-systems', 'message-queue'],
    company: 'LinkedIn',
  },

  // OS
  {
    domain: 'OS', difficulty: 'EASY', type: 'conceptual',
    question: 'What is the difference between a process and a thread?',
    idealAnswer: 'Process: independent execution unit with own memory space. Thread: lightweight process sharing memory with parent. Threads faster to create, cheaper context switch.',
    tags: ['process', 'thread', 'concurrency'],
  },
  {
    domain: 'OS', difficulty: 'MEDIUM', type: 'conceptual',
    question: 'Explain deadlock conditions and how to prevent them.',
    idealAnswer: 'Four conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Prevention: break any one condition. Detection: resource allocation graph. Avoidance: Banker\'s algorithm.',
    tags: ['deadlock', 'synchronization', 'operating-systems'],
  },

  // DBMS
  {
    domain: 'DBMS', difficulty: 'EASY', type: 'conceptual',
    question: 'What are ACID properties in databases?',
    idealAnswer: 'Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions independent), Durability (committed data persists). Ensures reliability.',
    tags: ['acid', 'transactions', 'databases'],
  },
  {
    domain: 'DBMS', difficulty: 'MEDIUM', type: 'conceptual',
    question: 'Explain the difference between clustered and non-clustered indexes.',
    idealAnswer: 'Clustered: data rows physically sorted by key, one per table, faster range queries. Non-clustered: separate structure pointing to data, multiple allowed, uses extra storage.',
    tags: ['indexes', 'performance', 'databases'],
  },

  // HR
  {
    domain: 'HR_BEHAVIORAL', difficulty: 'EASY', type: 'behavioral',
    question: 'Tell me about yourself.',
    idealAnswer: 'Structure: Present (current role/skills), Past (relevant experience), Future (why this role). 2-3 minutes. Focus on achievements, not just responsibilities.',
    tags: ['introduction', 'communication'],
  },
  {
    domain: 'HR_BEHAVIORAL', difficulty: 'MEDIUM', type: 'behavioral',
    question: 'Tell me about a time you faced a significant technical challenge. How did you handle it?',
    idealAnswer: 'Use STAR: Situation (context), Task (what needed doing), Action (specific steps taken), Result (measurable outcome). Emphasize learning and growth.',
    tags: ['star-method', 'problem-solving', 'technical-challenge'],
    company: 'Amazon',
  },

  // CN
  {
    domain: 'CN', difficulty: 'EASY', type: 'conceptual',
    question: 'What happens when you type a URL in a browser?',
    idealAnswer: 'DNS lookup → TCP connection (3-way handshake) → TLS handshake → HTTP request → Server processing → HTTP response → Browser renders HTML/CSS/JS.',
    tags: ['http', 'dns', 'networking'],
  },
  {
    domain: 'CN', difficulty: 'MEDIUM', type: 'conceptual',
    question: 'Explain the difference between TCP and UDP. When would you use each?',
    idealAnswer: 'TCP: reliable, ordered, connection-oriented, slower. UDP: unreliable, unordered, connectionless, faster. TCP for: HTTP, email, file transfer. UDP for: video streaming, gaming, DNS.',
    tags: ['tcp', 'udp', 'transport-layer'],
  },
];

async function main() {
  console.log('Seeding questions...');

  for (const q of QUESTIONS) {
    await prisma.question.create({ data: q as any });
  }

  console.log(`✅ Seeded ${QUESTIONS.length} questions`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
