//https://stackblitz.com/edit/angular-ucxm2s


import { Component, ElementRef, Injector } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router, Event } from '@angular/router';
import { NotesService } from './notes.service';
import { Note } from "./note.model";
import { LocalStorageService } from '../core/local-storage.service';
import { TagsService } from '../tags/tags.service';

import { Observable } from 'rxjs';
import { takeUntil, catchError, tap, map, startWith } from 'rxjs/operators';
import { Tag } from '../tags/tag.model';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../core/language.service';
import { CellClickedEvent } from 'ag-grid';
import { ViewChild } from '@angular/core';
import { MatInput, MatAutocompleteSelectedEvent } from '@angular/material';
import { ENTER, COMMA } from "@angular/cdk/keycodes";
import { Store } from '../core/store';

var moment: any;

@Component({
  selector: 'app-edit-note-page',
  templateUrl: './edit-note-page.component.html',
  styleUrls: ['./edit-note-page.component.css']
})
export class EditNotePageComponent {
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _elementRef: ElementRef,
    private _languageService: LanguageService,
    private _localStorageService: LocalStorageService,
    private _notesService: NotesService,
    private _tagsService: TagsService,
    private _tagStore: Store,
    private _router: Router
  ) {    
    this.editorPlaceholder = this._languageService.currentTranslations[this.editorPlaceholder];
  }

  canDeactivate() {

  }

  ngOnInit() {
    if (this.slug)
      this._notesService
        .getBySlug({ slug: this.slug })
        .pipe(
          takeUntil(this.onDestroy),
          map(x => this.note$.next(x.note))
        )
        .subscribe();

    this._tagsService.get()
      .pipe(takeUntil(this.onDestroy))
      .subscribe(x => this._tagStore.tags$.next(x.tags));

    this.addItems = new FormControl();
    
    this.filteredItems = this.addItems.valueChanges
      .pipe(
        startWith(''),
        map(item =>
          item ? this.filterItems(item.toString()) : this.items.slice())
      );
  }

  @ViewChild('chipInput')
  chipInput: MatInput;

  selectedItems: string[] = [];
  
  filteredItems: Observable<any[]>;

  addItems: FormControl;

  separatorKeysCodes = [ENTER, COMMA];

  get itemsData(): string[] {
    return this.selectedItems;
  }

  set itemsData(v: string[]) {
    this.selectedItems = v;
  }

  items: any[] = [{ tagId: 1, name: 'Samsung' },
  { tagId: 2, name: 'Nokia' },
  { tagId: 3, name: 'Redmi' },
  { tagId: 4, name: 'Moto' },
  { tagId: 5, name: 'Apple' }
  ];

  public notes$: BehaviorSubject<Note> = new BehaviorSubject(<Note>{});

  public get tags$():Observable<Array<Tag>> {
    return this._tagStore.tags$;
  }

  public note$: BehaviorSubject<Note> = new BehaviorSubject(new Note());

  public onDestroy: Subject<void> = new Subject();

  public quillEditorFormControl: FormControl = new FormControl('');
  
  public handleSaveClick() {
    
    this._notesService.save({
      note: this.form.value,
    })
      .pipe(
        takeUntil(this.onDestroy),
        tap(() => this._router.navigateByUrl("/notes"))
      )
      .subscribe();
  }
  
  public editorPlaceholder: string = "Compose a note...";

  public handleNoteTagClick(tag: Tag) {        
    this._router.navigate(["notes","tag",tag.tagId]);
  }

  public note: Note = <Note>{};
  
  public form = new FormGroup({
    title: new FormControl(this.note.title, [Validators.required]),
    body: new FormControl(this.note.body, [Validators.required]),
  });

  public get slug():string {
    return this._activatedRoute.snapshot.params["slug"];  
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  filterItems(itemName: string) {
    return this.items.filter(item =>
      item.name.toLowerCase().indexOf(itemName.toLowerCase()) === 0);
  }
  
  onRemoveItems(itemName: string): void {
    this.selectedItems = this.selectedItems.filter((name: string) => name !== itemName);
    this.itemsData = this.selectedItems;
    this.chipInput['nativeElement'].blur();
  }
  onTagClicked(tag) {
    alert("?");
  }
  onAddItems(event: MatAutocompleteSelectedEvent) {
    const t: any = event.option.value;

    if (this.selectedItems.length === 0) {
      this.selectedItems.push(t.name);
    } else {

      const selectLanguageStr = JSON.stringify(this.selectedItems);
      if (selectLanguageStr.indexOf(t.name) === -1) {
        this.selectedItems.push(t.name);
      }
    };

    this.itemsData = this.selectedItems;
    this.chipInput['nativeElement'].blur();
    this.chipInput['nativeElement'].value = '';
  }
}
