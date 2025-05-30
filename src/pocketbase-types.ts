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
	Connection = "connection",
	Note = "note",
	NoteChange = "noteChange",
	Pomodoro = "pomodoro",
	Tag = "tag",
	Task = "task",
	TaskHistory = "taskHistory",
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

export type ConnectionRecord = {
	confirmed?: boolean
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	user1?: RecordIdString
	user2?: RecordIdString
}

export type NoteRecord = {
	attachments?: RecordIdString[]
	content?: HTMLString
	created?: IsoDateString
	id: string
	tags?: RecordIdString[]
	title?: string
	updated?: IsoDateString
	user?: RecordIdString[]
	status?: boolean
}

export type NoteChangeRecord = {
	contentPatch?: HTMLString
	created?: IsoDateString
	id: string
	note?: RecordIdString
	title?: string
	user?: RecordIdString[]
}

export type PomodoroRecord = {
	created?: IsoDateString
	duration: number
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type TagRecord = {
	color?: string
	created?: IsoDateString
	id: string
	name?: string
	updated?: IsoDateString
	user?: RecordIdString[]
}

export type TaskRecord = {
	created?: IsoDateString
	description?: HTMLString
	endDate?: IsoDateString
	id: string
	isAllDay?: boolean
	title: string
	startDate?: IsoDateString
	status?: boolean
	tags?: RecordIdString[]
	user?: RecordIdString[]
}

export type TaskHistoryRecord = {
	created?: IsoDateString
	description?: HTMLString
	endDate?: IsoDateString
	id: string
	isAllDay?: boolean
	title?: string
	startDate?: IsoDateString
	status?: boolean
	task?: RecordIdString
	user?: RecordIdString
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
export type ConnectionResponse<Texpand = unknown> = Required<ConnectionRecord> & BaseSystemFields<Texpand>
export type NoteResponse<Texpand = unknown> = Required<NoteRecord> & BaseSystemFields<Texpand>
export type NoteChangeResponse<Texpand = unknown> = Required<NoteChangeRecord> & BaseSystemFields<Texpand>
export type PomodoroResponse<Texpand = unknown> = Required<PomodoroRecord> & BaseSystemFields<Texpand>
export type TagResponse<Texpand = unknown> = Required<TagRecord> & BaseSystemFields<Texpand>
export type TaskResponse<Texpand = unknown> = Required<TaskRecord> & BaseSystemFields<Texpand>
export type TaskHistoryResponse<Texpand = unknown> = Required<TaskHistoryRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	attachment: AttachmentRecord
	connection: ConnectionRecord
	note: NoteRecord
	noteChange: NoteChangeRecord
	pomodoro: PomodoroRecord
	tag: TagRecord
	task: TaskRecord
	taskHistory: TaskHistoryRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	attachment: AttachmentResponse
	connection: ConnectionResponse
	note: NoteResponse
	noteChange: NoteChangeResponse
	pomodoro: PomodoroResponse
	tag: TagResponse
	task: TaskResponse
	taskHistory: TaskHistoryResponse
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
	collection(idOrName: 'connection'): RecordService<ConnectionResponse>
	collection(idOrName: 'note'): RecordService<NoteResponse>
	collection(idOrName: 'noteChange'): RecordService<NoteChangeResponse>
	collection(idOrName: 'pomodoro'): RecordService<PomodoroResponse>
	collection(idOrName: 'tag'): RecordService<TagResponse>
	collection(idOrName: 'task'): RecordService<TaskResponse>
	collection(idOrName: 'taskHistory'): RecordService<TaskHistoryResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
