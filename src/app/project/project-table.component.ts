import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IProject } from './project';
import { ProjectService } from './project.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UnsavedChangesDialogComponent } from './unsaved-changes-dialog';

@Component({
  selector: 'app-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss']
})
export class ProjectTableComponent implements OnInit {
  pageTitle = 'Project Dashboard';
  errorMessage: string;
  filteredProjectModels: IProject[] = [];
  projectModels: IProject[] = [];
  projectsForm: FormGroup;

  titleFilter: string;
  divisionFilter: string;
  projectOwnerFilter: string;
  budgetFilter: number;
  statusFilter: string;
  createdStartDateFilter: Date;
  createdEndDateFilter: Date;
  modifiedStartDateFilter: Date;
  modifiedEndDateFilter: Date;

  budgetTotal = 0;

  constructor(private fb: FormBuilder, private projectService: ProjectService, public snackBar: MatSnackBar, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.projectsForm = this.fb.group({
      projects: this.fb.array([])
    });
    this.getProjects();
  }

  getProjects(): void {
    this.projectService.getProjects()
      .subscribe({
        next: (projects: IProject[]) => {
          this.projectModels = projects;
          this.filteredProjectModels = this.isFilterCriteria() ? this.performFilter(projects) : projects;
          this.displayProjects(this.filteredProjectModels);
        },
        error: err => this.errorMessage = err
      });
  }

  displayProjects(projects: IProject[]) {
    if (this.projectsForm) {
      this.projectsForm.reset();
    }

    this.projectsForm.setControl('projects', this.fb.array([]));

    const numberPatern = '^[0-9.,]+$';

    const control = this.projectsForm.get('projects') as FormArray;
    for (const project of projects) {
      const grp = this.fb.group({
        title: [project.title],
        division: [project.division],
        project_owner: [project.project_owner, [Validators.required]],
        budget: [project.budget, [Validators.required, Validators.pattern(numberPatern)]],
        status: [project.status, Validators.required],
        created: [project.created],
        modified: [project.modified]
      });

      grp.controls['budget'].valueChanges.subscribe(() => {
        this.budgetTotal = this.calculateBudgetTotal();
      });

      control.push(grp);
    }

    this.budgetTotal = this.calculateBudgetTotal();
  }

  calculateBudgetTotal() {
    let budgetTotal = 0;
    const control = this.projectsForm.get('projects') as FormArray;
    for (const formGroup of control.controls) {
      budgetTotal += formGroup.get('budget').value;
    }
    return budgetTotal;
  }

  performFilter(projects: IProject[]): IProject[] {
    let filterBy;

    if (this.titleFilter) {
      filterBy = this.titleFilter.toLocaleLowerCase();
      projects = projects.filter((project: IProject) =>
        project.title.toLocaleLowerCase().indexOf(filterBy) !== -1);
    }

    if (this.divisionFilter) {
      filterBy = this.divisionFilter.toLocaleLowerCase();
      projects = projects.filter((project: IProject) =>
        project.division.toLocaleLowerCase().indexOf(filterBy) !== -1);
    }

    if (this.projectOwnerFilter) {
      filterBy = this.projectOwnerFilter.toLocaleLowerCase();
      projects = projects.filter((project: IProject) =>
        project.project_owner.toLocaleLowerCase().indexOf(filterBy) !== -1);
    }

    if (this.budgetFilter) {
      projects = projects.filter((project: IProject) =>
        project.budget === this.budgetFilter);
    }

    if (this.statusFilter) {
      filterBy = this.statusFilter.toLocaleLowerCase();
      projects = projects.filter((project: IProject) =>
        project.status.toLocaleLowerCase().indexOf(filterBy) !== -1);
    }

    if (this.createdStartDateFilter || this.createdEndDateFilter) {
      const startDate = new Date(this.createdStartDateFilter);
      const endDate = new Date(this.createdEndDateFilter);
      if (this.createdStartDateFilter && this.createdEndDateFilter) {
        projects = projects.filter((project: IProject) => {
          const created = new Date(project.created);
          return created >= startDate && created <= endDate;
        });
      } else if (this.createdStartDateFilter) {
        projects = projects.filter((project: IProject) => {
          const created = new Date(project.created);
          return created >= startDate;
        });
      } else {
        projects = projects.filter((project: IProject) => {
          const created = new Date(project.created);
          return created <= endDate;
        });
      }
    }

    if (this.modifiedStartDateFilter || this.modifiedEndDateFilter) {
      const startDate = new Date(this.modifiedStartDateFilter);
      const endDate = new Date(this.modifiedEndDateFilter);
      if (this.modifiedStartDateFilter && this.modifiedEndDateFilter) {
        projects = projects.filter((project: IProject) => {
          const modified = new Date(project.modified);
          return modified >= startDate && modified <= endDate;
        });
      } else if (this.modifiedStartDateFilter) {
        projects = projects.filter((project: IProject) => {
          const modified = new Date(project.modified);
          return modified >= startDate;
        });
      } else {
        projects = projects.filter((project: IProject) => {
          const modified = new Date(project.modified);
          return modified <= endDate;
        });
      }
    }

    return projects;
  }

  isFilterCriteria() {
    return this.titleFilter ||
      this.divisionFilter ||
      this.projectOwnerFilter ||
      this.statusFilter ||
      this.budgetFilter ||
      this.createdStartDateFilter ||
      this.createdEndDateFilter ||
      this.modifiedStartDateFilter ||
      this.modifiedEndDateFilter;
  }

  get getFormData(): FormArray {
    return this.projectsForm.get('projects') as FormArray;
  }

  remove(index: number) {
    const control = this.projectsForm.get('projects') as FormArray;
    control.removeAt(index);
    this.save();
  }

  save() {
    if (this.projectsForm.valid) {

      const projects = [];
      const control = this.projectsForm.get('projects') as FormArray;
      for (const c of control.controls) {
        projects.push({ ...c.value });
      }

      this.projectService.updateProjects(projects).subscribe(results => {
        this.openSnackBar('Projects Successfully Updated', '');
        this.getProjects();
      });
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  search() {
    if (this.projectsForm.dirty) {
      const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
        width: '400px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.filteredProjectModels = this.isFilterCriteria() ? this.performFilter(this.projectModels) : this.projectModels;
          this.displayProjects(this.filteredProjectModels);
        }
      });
    } else {
      this.filteredProjectModels = this.isFilterCriteria() ? this.performFilter(this.projectModels) : this.projectModels;
      this.displayProjects(this.filteredProjectModels);
    }
  }

  clearSearch() {
    this.titleFilter = undefined;
    this.divisionFilter = undefined;
    this.projectOwnerFilter = undefined;
    this.budgetFilter = undefined;
    this.statusFilter = undefined;
    this.createdStartDateFilter = undefined;
    this.createdEndDateFilter = undefined;
    this.modifiedStartDateFilter = undefined;
    this.modifiedEndDateFilter = undefined;
  }

  getErrorBudget(group: FormGroup) {
    return group.controls.budget.errors.required ? 'Budget is required' :
      group.controls.budget.errors.pattern ? 'Budget must only contain numbers with two decimal place' : '';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
