import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ProjectTableComponent } from './project/project-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material-module';
import { UnsavedChangesDialogComponent } from './project/unsaved-changes-dialog';

@NgModule({
  declarations: [
    AppComponent, ProjectTableComponent, UnsavedChangesDialogComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  entryComponents: [UnsavedChangesDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
