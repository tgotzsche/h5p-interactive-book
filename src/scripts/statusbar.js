/**
 * Constructor function.
 */
class StatusBar extends H5P.EventDispatcher {
  constructor(contentId, totalChapters, parent, params) {
    super();
    this.id = contentId;
    this.parent = parent;

    console.log("what is params ?", params);
    this.params = this.extend(
      {
        l10n: {
          nextPage: 'Next page',
          previousPage: 'Previous page',
          navigateToTop: 'Navigate to the top',
        },
        a11y: {
          progress: 'Page @page of @total',
          menu: 'Toggle navigation menu',
        }
      },
      params || {}
    );

    this.totalChapters = totalChapters;
    this.arrows = this.addArrows();

    /**
     * Top row initializer
     */
    this.header = document.createElement('div');
    this.header.setAttribute('tabindex', '-1');
    this.headerInfo = document.createElement('div');
    this.header.classList.add('h5p-digibook-status-header');
    this.headerInfo.classList.add('h5p-digibook-status');

    this.headerProgressBar = this.addProgressBar();
    this.headerStatus = this.addProgress();
    this.footerStatus = this.addProgress();
    this.headerMenu = this.addMenu();
    this.buttonToTop = this.addToTop();

    this.headerChapterTitle = this.addChapterTitle();
    this.footerChapterTitle = this.addChapterTitle();



    this.header.appendChild(this.headerProgressBar.div);
    this.headerInfo.appendChild(this.headerMenu.div);
    this.headerInfo.appendChild(this.headerChapterTitle.div);
    this.headerInfo.appendChild(this.headerStatus.div);
    this.headerInfo.appendChild(this.arrows.divTopPrev);
    this.headerInfo.appendChild(this.arrows.divTopNext);
    this.header.appendChild(this.headerInfo);



    /**
     * Bottom row initializer
     */
    this.footer = document.createElement('div');
    this.footer.classList.add('h5p-digibook-status-footer');
    this.footerInfo = document.createElement('div');
    this.footerInfo.classList.add('h5p-digibook-status');

    this.footerProgressBar = this.addProgressBar();




    this.footer.appendChild(this.footerProgressBar.div);
    this.footerInfo.appendChild(this.buttonToTop.div);
    this.footerInfo.appendChild(this.footerChapterTitle.div);
    this.footerInfo.appendChild(this.footerStatus.div);
    this.footerInfo.appendChild(this.arrows.divBotPrev);
    this.footerInfo.appendChild(this.arrows.divBotNext);

    this.footer.appendChild(this.footerInfo);




    this.on('updateStatusBar', this.updateStatusBar);

    /**
     * Sequential traversal of chapters
     * Event should be either 'next' or 'prev'
     */
    this.on('seqChapter', (event) => {
      const eventInput = {
        h5pbookid: this.parent.contentId
      };
      if (event.data.toTop) {
        eventInput.section = "top";
      }

      if (event.data.direction === 'next') {
        if (this.parent.activeChapter+1 < this.parent.chapters.length) {
          eventInput.chapter = this.parent.chapters[this.parent.activeChapter+1].instance.subContentId;
        }
      }
      else if (event.data.direction === 'prev') {
        if (this.parent.activeChapter > 0) {
          eventInput.chapter = this.parent.chapters[this.parent.activeChapter-1].instance.subContentId;
        }
      }
      if (eventInput.chapter) {
        this.parent.trigger('newChapter', eventInput);
      }
    });
  }

  updateProgressBar(chapter) {
    let barWidth = ((chapter / this.totalChapters)*100)+"%";

    this.headerProgressBar.progress.style.width = barWidth;
    const title = this.params.a11y.progress
      .replace('@page', chapter)
      .replace('@total', this.totalChapters);
    this.headerProgressBar.progress.title = title;
    this.footerProgressBar.progress.style.width = barWidth;
    this.footerProgressBar.progress.title = title;

  }


  updateStatusBar() {
    const currChapter = this.parent.getActiveChapter()+1;

    const chapterTitle =  this.parent.chapters[this.parent.getActiveChapter()].title;

    this.headerStatus.current.innerHTML = currChapter;
    this.footerStatus.current.innerHTML = currChapter;

    this.updateProgressBar(currChapter);


    this.headerChapterTitle.p.innerHTML = chapterTitle;
    this.footerChapterTitle.p.innerHTML = chapterTitle;

    this.headerChapterTitle.p.setAttribute("title", chapterTitle);
    this.footerChapterTitle.p.setAttribute("title", chapterTitle);

    //assure that the buttons are valid in terms of chapter edges
    if (this.parent.activeChapter <= 0) {
      this.editButtonStatus('Prev', true);
    }
    else {
      this.editButtonStatus('Prev', false);
    }
    if ((this.parent.activeChapter+1) >= this.totalChapters) {
      this.editButtonStatus('Next', true);
    }
    else {
      this.editButtonStatus('Next', false);
    }
  }


  /**
   * Add traversal buttons for sequential travel (next and previous chapter)
   */
  addArrows() {
    const acm = {};

    // Initialize elements
    acm.divTopPrev = document.createElement('button');
    acm.divTopNext = document.createElement('button');
    acm.divBotPrev = document.createElement('button');
    acm.divBotNext = document.createElement('button');

    acm.botNext = document.createElement('div');
    acm.topNext = document.createElement('div');
    acm.botPrev = document.createElement('div');
    acm.topPrev = document.createElement('div');

    acm.divTopPrev.classList.add('h5p-digibook-status-arrow');
    acm.divTopPrev.classList.add('h5p-digibook-status-button');
    acm.divTopNext.classList.add('h5p-digibook-status-arrow');
    acm.divTopNext.classList.add('h5p-digibook-status-button');
    acm.divBotPrev.classList.add('h5p-digibook-status-arrow');
    acm.divBotPrev.classList.add('h5p-digibook-status-button');
    acm.divBotNext.classList.add('h5p-digibook-status-arrow');
    acm.divBotNext.classList.add('h5p-digibook-status-button');

    acm.topNext.classList.add('navigation-button');
    acm.botNext.classList.add('navigation-button');
    acm.topPrev.classList.add('navigation-button');
    acm.botPrev.classList.add('navigation-button');
    acm.topNext.classList.add('icon-next');
    acm.botNext.classList.add('icon-next');
    acm.topPrev.classList.add('icon-previous');
    acm.botPrev.classList.add('icon-previous');

    //Initialize trigger events
    acm.divTopPrev.onclick = () => {
      this.trigger('seqChapter', {
        direction:'prev',
        toTop: false
      });
    };
    acm.divTopNext.onclick = () => {
      this.trigger('seqChapter', {
        direction:'next',
        toTop: false
      });
    };

    acm.divBotPrev.onclick = () => {
      this.trigger('seqChapter', {
        direction:'prev',
        toTop: true
      });
    };
    acm.divBotNext.onclick = () => {
      this.trigger('seqChapter', {
        direction:'next',
        toTop: true
      });
    };

    //Add tooltip
    acm.topNext.setAttribute("title", this.params.l10n.nextPage);
    acm.botNext.setAttribute("title", this.params.l10n.nextPage);
    acm.topPrev.setAttribute("title", this.params.l10n.previousPage);
    acm.botPrev.setAttribute("title", this.params.l10n.previousPage);

    // Attach to the respective divs
    acm.divTopNext.appendChild(acm.topNext);
    acm.divTopPrev.appendChild(acm.topPrev);
    acm.divBotNext.appendChild(acm.botNext);
    acm.divBotPrev.appendChild(acm.botPrev);

    return acm;
  }

  /**
   * Add a menu button which hides and shows the navigation bar
   */
  addMenu() {
    const that = this;
    const row = document.createElement('button');
    const item = document.createElement('div');

    let iconType = 'icon-menu';
    row.setAttribute('aria-expanded', 'false');
    row.setAttribute('aria-controls', 'h5p-digibook-navigation-menu');
    if (this.params.behaviour.defaultTableOfContents) {
      row.classList.add('h5p-digibook-status-menu-active');
      row.setAttribute('aria-expanded', 'true');
    }
    item.classList.add(iconType);

    row.classList.add('h5p-digibook-status-menu');
    row.title = this.params.a11y.menu;
    row.classList.add('h5p-digibook-status-button');

    row.onclick = function () {
      that.parent.trigger('toggleMenu');
      this.classList.toggle('h5p-digibook-status-menu-active');
      this.setAttribute(
        'aria-expanded',
        this.classList.contains('h5p-digibook-status-menu-active') ? 'true' : 'false'
      );
    };

    row.appendChild(item);
    return {
      div:row,
      a:item
    };
  }

  addProgressBar() {
    const div = document.createElement('div');
    const progress = document.createElement('div');

    div.classList.add('h5p-digibook-status-progressbar-back');
    progress.classList.add('h5p-digibook-status-progressbar-front');
    progress.setAttribute('tabindex', '-1');
    div.appendChild(progress);

    return {
      div,
      progress
    };
  }

  /**
   * Add a paragraph which indicates which chapter is active
   */
  addChapterTitle() {
    const div = document.createElement('div');
    const chapterTitle = document.createElement('h1');
    chapterTitle.classList.add('title');
    div.classList.add('h5p-digibook-status-chapter');

    div.appendChild(chapterTitle);
    return {
      div,
      p:chapterTitle
    };

  }
  /**
   * Add a button which scrolls to the top of the page
   */
  addToTop() {
    const that = this;
    const div = document.createElement('div');
    const a = document.createElement('button');
    a.classList.add('navigation-button');
    div.classList.add('h5p-digibook-status-button');
    div.classList.add('h5p-digibook-status-arrow');
    a.classList.add ('icon-up');
    a.setAttribute('title', this.params.l10n.navigateToTop);
    a.onclick = function () {
      that.parent.trigger('scrollToTop');
    };
    div.appendChild(a);
    return {
      div,
      a
    };
  }

  /**
   * Edits the footer visibillity
   *
   * @param {Boolean} input
   */
  editFooterVisibillity(input) {
    if (input) {
      this.footer.classList.add('footer-hidden');
    }
    else {
      this.footer.classList.remove('footer-hidden');
    }
  }

  /**
   * Add a status-button which shows current and total chapters
   */
  addProgress() {
    const div = document.createElement('div');
    const p = document.createElement('p');
    const current = document.createElement('span');
    const divider = document.createElement('span');
    const total = document.createElement('span');

    p.classList.add('h5p-digibook-status-progress');

    current.classList.add('h5p-digibook-status-progress-number');
    divider.classList.add('h5p-digibook-status-progress-divider');
    total.classList.add('h5p-digibook-status-progress-number');

    divider.innerHTML = " / ";
    total.innerHTML = this.totalChapters;

    p.appendChild(current);
    p.appendChild(divider);
    p.appendChild(total);


    div.appendChild(p);
    return {
      div,
      current,
      total,
      divider,
      p
    };
  }

  /**
   * Edit button state on both the top and bottom bar
   * @param {bool} state
   */
  editButtonStatus(target, state) {
    if (state) {
      this.arrows['divTop'+target].setAttribute('disabled', 'disabled');
      this.arrows['divBot'+target].setAttribute('disabled', 'disabled');
      this.arrows['top'+target].classList.add('disabled');
      this.arrows['bot'+target].classList.add('disabled');
    }
    else {
      this.arrows['divTop'+target].removeAttribute('disabled');
      this.arrows['divBot'+target].removeAttribute('disabled');
      this.arrows['top'+target].classList.remove('disabled');
      this.arrows['bot'+target].classList.remove('disabled');
    }
  }

  /**
   * Extend an array just like JQuery's extend.
   *
   * @param {object} arguments Objects to be merged.
   * @return {object} Merged objects.
   */
  extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }
}
export default StatusBar;
