// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_flimsy_spirit.sql';
import m0001 from './0001_productive_stature.sql';
import m0002 from './0002_alter_user.sql'
import m0003 from './0003_alter_user.sql'
export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
  }
}
