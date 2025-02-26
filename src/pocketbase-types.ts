/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Attachment = "attachment",
	Note = "note",
	Pomodoro = "pomodoro",
	Task = "task",
	TaskHistory = "taskHistory",
	Todo = "todo",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type AttachmentRecord = {
	created?: IsoDateString
	file?: string
	fileName?: string
	id: string
	task?: RecordIdString
	updated?: IsoDateString
}

export type NoteRecord = {
	attachments?: RecordIdString[]
	content?: HTMLString
	created?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
	user?: RecordIdString[]
}

export type PomodoroRecord = {
	created?: IsoDateString
	duration: number
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type TaskRecord = {
	created?: IsoDateString
	description?: HTMLString
	endDate?: IsoDateString
	id: string
	isAllDay?: boolean
	name?: string
	startDate?: IsoDateString
	status?: boolean
	user?: RecordIdString[]
}

export type TaskHistoryRecord = {
	created?: IsoDateString
	description?: HTMLString
	endDate?: IsoDateString
	id: string
	isAllDay?: boolean
	name?: string
	startDate?: IsoDateString
	status?: boolean
	task?: RecordIdString
	user?: RecordIdString
}

export type TodoRecord = {
	created?: IsoDateString
	id: string
	status?: boolean
	title?: string
	updated?: IsoDateString
	userID: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AttachmentResponse<Texpand = unknown> = Required<AttachmentRecord> & BaseSystemFields<Texpand>
export type NoteResponse<Texpand = unknown> = Required<NoteRecord> & BaseSystemFields<Texpand>
export type PomodoroResponse<Texpand = unknown> = Required<PomodoroRecord> & BaseSystemFields<Texpand>
export type TaskResponse<Texpand = unknown> = Required<TaskRecord> & BaseSystemFields<Texpand>
export type TaskHistoryResponse<Texpand = unknown> = Required<TaskHistoryRecord> & BaseSystemFields<Texpand>
export type TodoResponse<Texpand = unknown> = Required<TodoRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	attachment: AttachmentRecord
	note: NoteRecord
	pomodoro: PomodoroRecord
	task: TaskRecord
	taskHistory: TaskHistoryRecord
	todo: TodoRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	attachment: AttachmentResponse
	note: NoteResponse
	pomodoro: PomodoroResponse
	task: TaskResponse
	taskHistory: TaskHistoryResponse
	todo: TodoResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'attachment'): RecordService<AttachmentResponse>
	collection(idOrName: 'note'): RecordService<NoteResponse>
	collection(idOrName: 'pomodoro'): RecordService<PomodoroResponse>
	collection(idOrName: 'task'): RecordService<TaskResponse>
	collection(idOrName: 'taskHistory'): RecordService<TaskHistoryResponse>
	collection(idOrName: 'todo'): RecordService<TodoResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
