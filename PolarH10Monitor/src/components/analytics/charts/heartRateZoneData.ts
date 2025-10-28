export interface ZoneInfo {
  name: string;
  range: string;
  color: string;
  description: string;
}

export interface ZoneDetail {
  title: string;
  subtitle: string;
  description: string;
  benefits: string;
  examples: string[];
  duration: string;
  feeling: string;
  when: string;
}

export const HEART_RATE_ZONES: ZoneInfo[] = [
  {
    name: 'Zone 1',
    range: '50-60%',
    color: '#4CAF50',
    description: 'Very Light',
  },
  {
    name: 'Zone 2',
    range: '60-70%',
    color: '#8BC34A',
    description: 'Light',
  },
  {
    name: 'Zone 3',
    range: '70-80%',
    color: '#FFC107',
    description: 'Moderate',
  },
  {
    name: 'Zone 4',
    range: '80-90%',
    color: '#FF9800',
    description: 'Hard',
  },
  {
    name: 'Zone 5',
    range: '90-100%',
    color: '#F44336',
    description: 'Maximum',
  },
];

export const ZONE_DETAILS: ZoneDetail[] = [
  {
    title: 'Zone 1 - Active Recovery',
    subtitle: '50-60% of Max Heart Rate',
    description:
      'Very gentle exercise that promotes recovery and blood flow without adding stress.',
    benefits:
      'Enhances recovery, improves circulation, reduces muscle soreness',
    examples: [
      'Easy walking with friends while chatting',
      'Gentle yoga or stretching sessions',
      'Leisurely bike ride around the neighborhood',
      'Easy swimming with relaxed strokes',
      'Light recreational activities',
    ],
    duration: 'Can sustain for hours',
    feeling: 'Very comfortable, barely breathing harder than normal',
    when: 'Recovery days, warm-ups, cool-downs, or when feeling tired',
  },
  {
    title: 'Zone 2 - Aerobic Base',
    subtitle: '60-70% of Max Heart Rate',
    description:
      'The foundation zone that builds aerobic capacity and fat-burning efficiency.',
    benefits:
      'Builds aerobic base, improves fat metabolism, develops capillary density',
    examples: [
      'Easy jogging where you can hold conversation',
      'Comfortable cycling pace on flat terrain',
      'Hiking uphill at steady, comfortable pace',
      'Continuous swimming with easy breathing',
      'Cross-country skiing at conversational pace',
    ],
    duration: '30 minutes to several hours',
    feeling: 'Comfortable effort, can speak in full sentences',
    when: '70-80% of your training should be in this zone',
  },
  {
    title: 'Zone 3 - Aerobic Threshold',
    subtitle: '70-80% of Max Heart Rate',
    description:
      'Moderately hard effort that improves aerobic power and endurance.',
    benefits: 'Improves aerobic power, lactate processing, race pace endurance',
    examples: [
      'Tempo runs or marathon race pace',
      'Steady cycling on rolling hills',
      'Swimming at comfortably hard pace',
      'Rowing at steady competitive pace',
      'Cross-training at moderate intensity',
    ],
    duration: '20-60 minutes for trained athletes',
    feeling: 'Moderately hard, can speak short phrases',
    when: 'Tempo workouts, longer threshold intervals',
  },
  {
    title: 'Zone 4 - Lactate Threshold',
    subtitle: '80-90% of Max Heart Rate',
    description:
      'Hard effort that improves anaerobic capacity and racing speed.',
    benefits: 'Improves lactate tolerance, anaerobic power, racing performance',
    examples: [
      '5K to 10K race pace running',
      'Hill climbing at hard effort',
      'Swimming sprint intervals',
      'Cycling time trial pace',
      'Rowing race pace efforts',
    ],
    duration: '8-40 minutes for trained athletes',
    feeling: 'Hard effort, can only speak single words',
    when: 'Interval training, race pace work, lactate threshold sessions',
  },
  {
    title: 'Zone 5 - Neuromuscular Power',
    subtitle: '90-100% of Max Heart Rate',
    description:
      'Maximum effort that develops speed, power, and neuromuscular coordination.',
    benefits:
      'Improves maximum power, speed, anaerobic capacity, neuromuscular efficiency',
    examples: [
      'All-out sprints of 15 seconds to 2 minutes',
      'Track intervals at mile pace or faster',
      'Hill repeats at maximum effort',
      'Swimming sprints with full recovery',
      'Cycling sprint intervals',
    ],
    duration: '15 seconds to 8 minutes with full recovery',
    feeling: 'Maximum effort, cannot speak',
    when: 'Speed work, short intervals, race preparation',
  },
];
