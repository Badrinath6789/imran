import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  /* ================= COUPLE DETAILS ================= */
  brideName = 'Nasrin Jaha Shaik';
  brideFather = 'Sk Khayrulla';
  brideMother = 'Sk Khayrunnissa';

  groomName = 'Imran Pathan';
  groomFather = 'P Rahaman';
  groomMother = 'P Mahabhi';

  /* ================= ENGAGEMENT DETAILS ================= */
  engagementDate = '04 October 2026';
  engagementDateForCountdown = 'October 04, 2026 13:00:00';
  engagementTime = '1:00 PM onwards';

  /* ================= VENUE ================= */
  venueName = 'Purushottam Patnam,Peerla Manyam';
  venueAddress = 'Near Huda Kareem Masjid,Palnadu District, Andhra Pradesh';
  mapUrl = 'https://maps.app.goo.gl/MgzaTEciCpC4AdJ76?g_st=ac';

  /* ================= ENVELOPE INTRO ================= */
  opened = false;
  introGone = false;
  vw = 390;
  vh = 800;
  petalsBack: any[] = [];
  petalsFlap: any[] = [];

  /** Letters shown on the wax seal, e.g. "BG" */
  get monogram(): string {
    return (this.brideName.charAt(0) + this.groomName.charAt(0)).toUpperCase();
  }

  /* ================= SCRATCH ================= */
  @ViewChild('scratchCanvas') scratchCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  isRevealed = false;

  /* ================= FLOWERS ================= */
  flowers: any[] = [];

  /* ================= COUNTDOWN ================= */
  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private countdownTimer: any;

  /* ================= INIT ================= */
  ngOnInit(): void {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.petalsBack = this.scatter(7);
    this.petalsFlap = this.scatter(31);
    document.body.style.overflow = 'hidden';   // lock scroll until the seal is opened
  }

  ngAfterViewInit(): void {
    this.setupScratchCard();
    this.startCountdown();
  }

  /* ================= INTRO ================= */
  private scatter(seed: number): any[] {
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const count = Math.round((this.vw * this.vh) / 9000);
    const out: any[] = [];
    for (let i = 0; i < count; i++) {
      const x = rnd() * (this.vw + 60) - 30;
      const y = rnd() * (this.vh + 60) - 30;
      const flower = rnd() > 0.55;
      const size = flower ? 70 + rnd() * 50 : 90 + rnd() * 60;
      out.push({
        t: flower ? 'flower' : 'leaf',
        x: x - size / 2,
        y: y - size / 2,
        s: size,
        r: `rotate(${rnd() * 360} ${x} ${y})`
      });
    }
    return out;
  }

  openInvite(): void {
    if (this.opened) { return; }
    this.opened = true;
    setTimeout(() => {
      this.introGone = true;
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
      this.createFlowers();
    }, 1700);
  }

  /* ================= SCRATCH CARD ================= */
  setupScratchCard(): void {
    const canvas = this.scratchCanvas.nativeElement;
    const container = canvas.parentElement as HTMLElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#c9a44c');
    gradient.addColorStop(0.5, '#f4df9b');
    gradient.addColorStop(1, '#b58a32');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    /* Heart-shaped scratch area */
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    const x = width / 2;
    const y = height / 2;
    const size = Math.min(width, height) * 0.38;
    this.ctx.moveTo(x, y + size * 0.8);
    this.ctx.bezierCurveTo(x - size * 1.5, y - size * 0.2, x - size * 0.8, y - size * 1.1, x, y - size * 0.35);
    this.ctx.bezierCurveTo(x + size * 0.8, y - size * 1.1, x + size * 1.5, y - size * 0.2, x, y + size * 0.8);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 18px Georgia';
    this.ctx.fillText('SCRATCH HERE', width / 2, height / 2 + 8);
  }

  startScratch(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isDrawing = true;
    this.scratch(event);
  }

  stopScratch(): void {
    this.isDrawing = false;
    this.checkScratchPercentage();
  }

  scratch(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) { return; }
    event.preventDefault();

    const canvas = this.scratchCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    // "'touches' in event" also works in browsers that don't define TouchEvent
    const point = 'touches' in event ? event.touches[0] : event;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';

    this.checkScratchPercentage();
  }

  checkScratchPercentage(): void {
    if (this.isRevealed) { return; }
    const canvas = this.scratchCanvas.nativeElement;
    const data = this.ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let transparent = 0;
    let sampled = 0;
    for (let i = 3; i < data.length; i += 16) {   // sample every 4th pixel for speed
      sampled++;
      if (data[i] === 0) { transparent++; }
    }

    if ((transparent / sampled) * 100 > 35) {
      this.revealLove();
    }
  }

  revealLove(): void {
    this.isRevealed = true;
    this.createFlowers();
    setTimeout(() => {
      this.scratchCanvas.nativeElement.style.opacity = '0';
    }, 300);
  }

  /* ================= FLOWER EFFECT ================= */
  createFlowers(): void {
    const symbols = ['🌸', '🌺', '🌼', '🌷', '✿', '❀'];
    this.flowers = [];
    for (let i = 0; i < 45; i++) {
      this.flowers.push({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 4,
        symbol: symbols[Math.floor(Math.random() * symbols.length)]
      });
    }
  }

  /* ================= COUNTDOWN ================= */
  startCountdown(): void {
    const target = new Date(this.engagementDateForCountdown).getTime();
    this.updateCountdown(target);
    this.countdownTimer = setInterval(() => this.updateCountdown(target), 1000);
  }

  updateCountdown(target: number): void {
    const difference = target - new Date().getTime();
    if (difference <= 0) {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }
    this.countdown.days = Math.floor(difference / (1000 * 60 * 60 * 24));
    this.countdown.hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    this.countdown.minutes = Math.floor((difference / (1000 * 60)) % 60);
    this.countdown.seconds = Math.floor((difference / 1000) % 60);
  }

  /* ================= DESTROY ================= */
  ngOnDestroy(): void {
    if (this.countdownTimer) { clearInterval(this.countdownTimer); }
    document.body.style.overflow = '';
  }
}
