
/* IMPORT */

import Consts from '../../consts';
import Item from './item';

/* COMMENT */

class Comment extends Item {

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.comment );

  }

}

/* EXPORT */

export default Comment;
