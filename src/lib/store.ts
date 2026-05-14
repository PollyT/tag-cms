export type Tag = {
  id: string;
  name: string; // Master version in English
  slug: string;
  locales: Record<string, string>; // Multi-locale versions
  description: string;
  h1: string;
  type: 'geo' | 'general';
  articleCount: number;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
};

export type AuditTag = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  locales?: Record<string, string>;
  sourceArticle: string;
  confidence: number;
  type: 'general' | 'geo';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type Article = {
  id: string;
  title: string;
  content: string;
  site: string;
  url: string;
  keyword: string;
  tags: string[]; // tag ids
};

export type TagGroup = {
  id: string;
  operator: 'AND' | 'OR';
  tags: string[];
};

export type TagPageQuery = {
  globalOperator: 'AND' | 'OR';
  groups: TagGroup[];
};

export function evaluateQuery(query: TagPageQuery, articleTags: string[]): boolean {
  if (!query.groups || query.groups.length === 0) return false;
  
  const evaluateGroup = (group: TagGroup) => {
    if (!group.tags || group.tags.length === 0) return true; // Empty group doesn't constrain
    if (group.operator === 'AND') {
      return group.tags.every(tid => articleTags.includes(tid));
    } else {
      return group.tags.some(tid => articleTags.includes(tid));
    }
  };

  const validGroups = query.groups.filter(g => g.tags && g.tags.length > 0);
  if (validGroups.length === 0) return false;

  if (query.globalOperator === 'AND') {
    return validGroups.every(evaluateGroup);
  } else {
    return validGroups.some(evaluateGroup);
  }
}

export type TagPage = {
  id: string;
  site: string; // locale id
  tags?: string[]; // Legacy tag ids
  query?: TagPageQuery; // New logic query
  name: string; // calculated or user defined
  articleCount: number;
  status: 'rendering' | 'pending' | 'unpublished' | 'published';
  createdAt: string;
};

export const INITIAL_ARTICLES: Article[] = [];

const tagStrings = [
  'Airports', 'Train Stations', 'Lounge', 'Luggage Storage', 'Duty-Free', 'Airport Food', 'Transit/Layovers', 'Locker Info', 'Platform Guide', 'City Transportation', 'A-to-B Travel', 'Airport to City', 'KTX', 'Europe Rail', 'Shinkasen', 'JR Pass', 'China Train', 'Maps', 'Metro Map', 'Metro', 'City Bus', 'Taxis', 'Transit Cards', 'Car Rental', 'Car Charter', 'Cross-border', 'Walking Tours', 'Flight Deals', 'Carry-on Rules', 'Airlines', 'Checked Luggage', 'Airline Ticket Policy', 'Refunds', 'Airline News', 'Airline Alliance', 'Airline Miles', 'Flight Check-in', 'Airline Seat', 'Flight Logistics', 'Hotels', 'Resorts', 'Alternative Stays', 'Family-Friendly Hotels', 'All-Inclusive Resort', 'Luxury Hotel', 'Budget Hostel', 'Ryokan', 'Workation-Friendly', 'Hotel Check-in', 'Themed Hotels', 'Long Stay', 'Backpacker', 'Staycation', 'Trip.com', 'Credit Card', 'Promo Code', 'Booking Fees', 'Booking Process', 'Member Rewards', 'Refund Policy', 'Deals', 'Flash Sales', 'Visa', 'Passport', 'Arrival Cards', 'eSIM/Phone', 'Travel Apps', 'Plug/Adapters', 'Payments', 'Tax Refund (VAT)', 'Travel Budget', 'Currency Exchange', 'Weather', 'Public Holiday', 'Travel Policy', 'Pack List', 'Things to Do', 'Solo Trip', 'Family-Friendly', 'Pet-Friendly', 'Couple Trip', 'Luxury Trip', 'Budget Travel', 'Muslim-Friendly', 'Attractions', 'Best Time to Visit', 'Day Trip', 'Shopping', 'Souvenirs', 'DIY Travel', 'Guided Tours', 'Itineraries', 'Group Tours', 'Museums', 'Nature', 'Parks', 'Spa&Massage', 'Culture&Arts', 'Costume Rental', 'Theme Parks', 'Zoo', 'Tickets', 'Entertainment', 'Traveling with Children', 'Traveling with Pets', 'Nightlife', 'Cafe', 'Restaurants', 'Fine Dining', 'Dietary Needs', 'Breakfast', 'Seasonal Food', 'Must-Eat Lists', 'Concerts&Shows', 'Esports&Sports', 'Event Ticketing', 'Event Venues', 'Skiing', 'Cherry Blossom', 'Hot Spring', 'Christmas', 'Valentine', 'New Year', 'Snowboarding', 'Sauna', 'Summer Holiday', 'Fireworks', 'White Day', 'Halloween', 'Autumn Leaves', 'MixC World Shenzhen Bay', 'Skyworthland CINITY Cinema', 'CGV Cinema Futian', 'KK MALL', 'Huanle Coast'
];

const geoTagStrings = [
  'China', 'Japan', 'Shenzhen', 'Hong Kong', 'Tokyo', 'Shanghai', 'Guangzhou', 'Zhuhai', 'Osaka', 'Fukuoka', 'Chengdu', 'Beijing', 'Chongqing', 'Harbin', 'Xi\'an', 'Xiamen', 'Hangzhou', 'Nagoya', 'Okinawa', 'Zhangjiajie', 'Kyoto', 'Sapporo', 'Sanya'
];

const translations: Record<string, Record<string, string>> = {
  'Airports': { tw: '機場', hk: '機場', jp: '空港', kr: '공항', th: 'สนามบิน', ru: 'Аэропорты', my: 'Lapangan Terbang' },
  'Train Stations': { tw: '火車站', hk: '火車站', jp: '駅', kr: '기차역', th: 'สถานีรถไฟ', ru: 'Вокзалы', my: 'Stesen Kereta Api' },
  'Lounge': { tw: '貴賓室', hk: '貴賓室', jp: 'ラウンジ', kr: '라운지', th: 'เลานจ์', ru: 'Лаундж', my: 'Ruang Rehat' },
  'Luggage Storage': { tw: '行李寄存', hk: '行李寄存', jp: '荷物預かり', kr: '수하물 보관', th: 'ที่ฝากกระเป๋า', ru: 'Камера хранения', my: 'Penyimpanan Bagasi' },
  'Duty-Free': { tw: '免稅店', hk: '免稅店', jp: '免税', kr: '면세', th: 'ปลอดภาษี', ru: 'Дьюти-фри', my: 'Bebas Cukai' },
  'Airport Food': { tw: '機場餐飲', hk: '機場餐飲', jp: '空港の食事', kr: '공항 음식', th: 'อาหารสนามบิน', ru: 'Еда в аэропорту', my: 'Makanan Lapangan Terbang' },
  'Transit/Layovers': { tw: '轉機/中轉', hk: '轉機/過境', jp: '乗り継ぎ', kr: '환승/경유', th: 'ต่อเครื่อง', ru: 'Транзит/Пересадка', my: 'Transit/Singgah' },
  'Locker Info': { tw: '儲物櫃資訊', hk: '儲物櫃資訊', jp: 'ロッカー情報', kr: '물품 보관함 안내', th: 'ข้อมูลล็อคเกอร์', ru: 'Информация о локерах', my: 'Maklumat Loker' },
  'Platform Guide': { tw: '月台指南', hk: '月台指南', jp: 'ホームガイド', kr: '승강장 안내', th: 'คำแนะนำแพลตฟอร์ม', ru: 'Гид по платформам', my: 'Panduan Platform' },
  'City Transportation': { tw: '市內交通', hk: '市內交通', jp: '市内交通', kr: '시내 교통', th: 'การขนส่งในเมือง', ru: 'Городской транспорт', my: 'Pengangkutan Bandar' },
  'Airport to City': { tw: '機場到市區', hk: '機場出市區', jp: '空港から市内へ', kr: '공항에서 시내로', th: 'สนามบินสู่เมือง', ru: 'Аэропорт - Город', my: 'Lapangan Terbang ke Bandar' },
  'Maps': { tw: '地圖', hk: '地圖', jp: '地図', kr: '지도', th: 'แผนที่', ru: 'Карты', my: 'Peta' },
  'Metro Map': { tw: '地鐵圖', hk: '港鐵路線圖', jp: '地下鉄路線図', kr: '지하철 노선도', th: 'แผนที่รถไฟใต้ดิน', ru: 'Карта метро', my: 'Peta Metro' },
  'Metro': { tw: '捷運', hk: '地鐵', jp: '地下鉄', kr: '지하철', th: 'รถไฟใต้ดิน', ru: 'Метро', my: 'Metro' },
  'City Bus': { tw: '市區公車', hk: '市區巴士', jp: '路線バス', kr: '시내 버스', th: 'รถบัสประจำทาง', ru: 'Городской автобус', my: 'Bas Bandar' },
  'Taxis': { tw: '計程車', hk: '的士', jp: 'タクシー', kr: '택시', th: 'แท็กซี่', ru: 'Такси', my: 'Teksi' },
  'Transit Cards': { tw: '交通卡', hk: '交通卡', jp: '交通系ICカード', kr: '교통카드', th: 'บัตรโดยสาร', ru: 'Транспортные карты', my: 'Kad Transit' },
  'Car Rental': { tw: '租車', hk: '租車', jp: 'レンタカー', kr: '렌터카', th: 'เช่ารถ', ru: 'Аренда авто', my: 'Sewa Kereta' },
  'Flight Deals': { tw: '機票優惠', hk: '機票優惠', jp: '航空券セール', kr: '항공권 특가', th: 'โปรโมชั่นเที่ยวบิน', ru: 'Авиабилеты со скидкой', my: 'Tawaran Penerbangan' },
  'Airlines': { tw: '航空公司', hk: '航空公司', jp: '航空会社', kr: '항공사', th: 'สายการบิน', ru: 'Авиакомпании', my: 'Syarikat Penerbangan' },
  'Refunds': { tw: '退款', hk: '退款', jp: '払い戻し', kr: '환불', th: 'การคืนเงิน', ru: 'Возвраты', my: 'Bayaran Balik' },
  'Hotels': { tw: '飯店', hk: '酒店', jp: 'ホテル', kr: '호텔', th: 'โรงแรม', ru: 'Отели', my: 'Hotel' },
  'Resorts': { tw: '渡假村', hk: '度假村', jp: 'リゾート', kr: '리조트', th: 'รีสอร์ท', ru: 'Курорты', my: 'Resort' },
  'Luxury Hotel': { tw: '豪華飯店', hk: '奢華酒店', jp: '高級ホテル', kr: '럭셔리 호텔', th: 'โรงแรมหรู', ru: 'Роскошные отели', my: 'Hotel Mewah' },
  'Budget Hostel': { tw: '平價青旅', hk: '平價青年旅館', jp: '格安ホステル', kr: '가성비 호스텔', th: 'โฮสเทลราคาประหยัด', ru: 'Бюджетный хостел', my: 'Hostel Bajet' },
  'Visa': { tw: '簽證', hk: '簽證', jp: 'ビザ', kr: '비자', th: 'วีซ่า', ru: 'Виза', my: 'Visa' },
  'Passport': { tw: '護照', hk: '護照', jp: 'パスポート', kr: '여권', th: 'หนังสือเดินทาง', ru: 'Паспорт', my: 'Pasport' },
  'eSIM/Phone': { tw: 'eSIM/網卡', hk: 'eSIM/電話卡', jp: 'eSIM/SIMカード', kr: 'eSIM/유심', th: 'eSIM/ซิมการ์ด', ru: 'eSIM/Связь', my: 'eSIM/Telefon' },
  'Payments': { tw: '付款方式', hk: '付款方式', jp: '支払い', kr: '결제', th: 'การชำระเงิน', ru: 'Платежи', my: 'Pembayaran' },
  'Currency Exchange': { tw: '換匯', hk: '外幣兌換', jp: '両替', kr: '환전', th: 'แลกเปลี่ยนเงินตรา', ru: 'Обмен валют', my: 'Tukaran Mata Wang' },
  'Weather': { tw: '天氣', hk: '天氣', jp: '天気', kr: '날씨', th: 'สภาพอากาศ', ru: 'Погода', my: 'Cuaca' },
  'Public Holiday': { tw: '國定假日', hk: '公眾假期', jp: '祝日', kr: '공휴일', th: 'วันหยุดนักขัตฤกษ์', ru: 'Государственные праздники', my: 'Cuti Umum' },
  'Things to Do': { tw: '景點活動', hk: '玩樂好去處', jp: '観光・アクティビティ', kr: '즐길 거리', th: 'สิ่งที่ต้องทำ', ru: 'Чем заняться', my: 'Aktiviti Menarik' },
  'Shopping': { tw: '購物', hk: '購物', jp: 'ショッピング', kr: '쇼핑', th: 'ช้อปปิ้ง', ru: 'Шопинг', my: 'Membeli-belah' },
  'Souvenirs': { tw: '伴手禮', hk: '手信', jp: 'お土産', kr: '기념품', th: 'ของฝาก', ru: 'Сувениры', my: 'Cenderamata' },
  'Museums': { tw: '博物館', hk: '博物館', jp: '博物館', kr: '박물관', th: 'พิพิธภัณฑ์', ru: 'Музеи', my: 'Muzium' },
  'Culture&Arts': { tw: '藝文', hk: '文化藝術', jp: '文化・芸術', kr: '문화&예술', th: 'ศิลปะและวัฒนธรรม', ru: 'Культура и Искусство', my: 'Kebudayaan & Seni' },
  'Theme Parks': { tw: '主題樂園', hk: '主題樂園', jp: 'テーマパーク', kr: '테마파크', th: 'สวนสนุก', ru: 'Тематические парки', my: 'Taman Tema' },
  'Restaurants': { tw: '餐廳', hk: '餐廳', jp: 'レストラン', kr: '레스토랑', th: 'ร้านอาหาร', ru: 'Рестораны', my: 'Restoran' },
  'Cherry Blossom': { tw: '櫻花', hk: '櫻花', jp: '桜', kr: '벚꽃', th: 'ซากุระ', ru: 'Цветение сакуры', my: 'Bunga Sakura' },
  'China': { tw: '中國', hk: '中國', jp: '中国', kr: '중국', th: 'จีน', ru: 'Китай', my: 'China' },
  'Japan': { tw: '日本', hk: '日本', jp: '日本', kr: '일본', th: 'ญี่ปุ่น', ru: 'Япония', my: 'Jepun' },
  'Shenzhen': { tw: '深圳', hk: '深圳', jp: '深セン', kr: '선전', th: 'เซินเจิ้น', ru: 'Шэньчжэнь', my: 'Shenzhen' },
  'Tokyo': { tw: '東京', hk: '東京', jp: '東京', kr: '도쿄', th: 'โตเกียว', ru: 'Токио', my: 'Tokyo' },
  'Shanghai': { tw: '上海', hk: '上海', jp: '上海', kr: '상하이', th: 'เซี่ยงไฮ้', ru: 'Шанхай', my: 'Shanghai' },
  'Guangzhou': { tw: '廣州', hk: '廣州', jp: '広州', kr: '광저우', th: 'กว่างโจว', ru: 'Гуанчжоу', my: 'Guangzhou' },
  'Zhuhai': { tw: '珠海', hk: '珠海', jp: '珠海', kr: '주하이', th: 'จูไห่', ru: 'Чжухай', my: 'Zhuhai' },
  'Osaka': { tw: '大阪', hk: '大阪', jp: '大阪', kr: '오사카', th: 'โอซาก้า', ru: 'Осака', my: 'Osaka' },
  'Fukuoka': { tw: '福岡', hk: '福岡', jp: '福岡', kr: '후쿠오카', th: 'ฟุกุโอกะ', ru: 'Фукуока', my: 'Fukuoka' },
  'Chengdu': { tw: '成都', hk: '成都', jp: '成都', kr: '청두', th: 'เฉิงตู', ru: 'Чэнду', my: 'Chengdu' },
  'Beijing': { tw: '北京', hk: '北京', jp: '北京', kr: '베이징', th: 'ปักกิ่ง', ru: 'Пекин', my: 'Beijing' },
  'Chongqing': { tw: '重慶', hk: '重慶', jp: '重慶', kr: '충칭', th: 'ฉงชิ่ง', ru: 'Чунцин', my: 'Chongqing' },
  'Harbin': { tw: '哈爾濱', hk: '哈爾濱', jp: 'ハルビン', kr: '하얼빈', th: 'ฮาร์บิน', ru: 'Харбин', my: 'Harbin' },
  'Xi\'an': { tw: '西安', hk: '西安', jp: '西安', kr: '시안', th: 'ซีอาน', ru: 'Сиань', my: 'Xi\'an' },
  'Xiamen': { tw: '廈門', hk: '廈門', jp: 'アモイ', kr: '샤먼', th: 'เซียะเหมิน', ru: 'Сямэнь', my: 'Xiamen' },
  'Hangzhou': { tw: '杭州', hk: '杭州', jp: '杭州', kr: '항저우', th: 'หางโจว', ru: 'Ханчжоу', my: 'Hangzhou' },
  'Nagoya': { tw: '名古屋', hk: '名古屋', jp: '名古屋', kr: '나고야', th: 'นาโกย่า', ru: 'Нагоя', my: 'Nagoya' },
  'Okinawa': { tw: '沖繩', hk: '沖繩', jp: '沖縄', kr: '오키나와', th: 'โอกินาว่า', ru: 'Окинава', my: 'Okinawa' },
  'Zhangjiajie': { tw: '張家界', hk: '張家界', jp: '張家界', kr: '장자제', th: 'จางเจียเจี้ย', ru: 'Чжанцзяцзе', my: 'Zhangjiajie' },
  'Kyoto': { tw: '京都', hk: '京都', jp: '京都', kr: '교토', th: 'เกียวโต', ru: 'Киото', my: 'Kyoto' },
  'Sapporo': { tw: '札幌', hk: '札幌', jp: '札幌', kr: '삿포로', th: 'ซัปโปโร', ru: 'Саппоро', my: 'Sapporo' },
  'Sanya': { tw: '三亞', hk: '三亞', jp: '三亜', kr: '싼야', th: 'ซานย่า', ru: 'Санья', my: 'Sanya' },
};

export const INITIAL_TAGS: Tag[] = [
  ...tagStrings.map((name, i) => {
    const trans = translations[name];
    return {
      id: String(i + 1),
      name, // Master English name
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      type: 'general' as const,
      locales: trans ? { ...trans } : {
        tw: `${name}`,
        hk: `${name}`,
        jp: `${name}`,
        kr: `${name}`,
        th: `${name}`,
        ru: `${name}`,
        my: `${name}`,
      },
      description: `${name} related articles`,
      h1: name,
      articleCount: Math.floor(Math.random() * 100),
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }),
  ...geoTagStrings.map((name, i) => {
    const trans = translations[name];
    return {
      id: String(tagStrings.length + i + 1),
      name, // Master English name
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      type: 'geo' as const,
      locales: trans ? { ...trans } : {
        tw: `${name}`,
        hk: `${name}`,
        jp: `${name}`,
        kr: `${name}`,
        th: `${name}`,
        ru: `${name}`,
        my: `${name}`,
      },
      description: `${name} destinations`,
      h1: name,
      articleCount: Math.floor(Math.random() * 100),
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  })
];

export const INITIAL_AUDIT_QUEUE: AuditTag[] = [
  { id: 'a1', name: 'China', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 1.00, type: 'geo', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a2', name: 'Shenzhen', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 1.00, type: 'geo', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a3', name: 'Hong Kong', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.70, type: 'geo', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a4', name: 'MixC World Shenzhen Bay', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.80, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a5', name: 'Skyworthland CINITY Cinema', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.70, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a6', name: 'CGV Cinema Futian', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.70, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a7', name: 'KK MALL', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.60, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a8', name: 'Huanle Coast', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.60, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a9', name: 'Entertainment', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 1.00, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a10', name: 'Tickets', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.90, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a11', name: 'Cross-border', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.90, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a12', name: 'Things to Do', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.80, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'a13', name: 'Day Trip', sourceArticle: 'Weekend Getaway to Shenzhen', confidence: 0.80, type: 'general', status: 'pending', createdAt: new Date().toISOString() },
];
