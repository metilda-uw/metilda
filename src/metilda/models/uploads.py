import persistent
import persistent.dict


class MetildaUpload(persistent.Persistent):
    def __init__(self, file_bytes):
        self.file_bytes = file_bytes


class MetildaUploadCrud(persistent.Persistent):
    def __init__(self):
        self.upload_lookup = persistent.dict.PersistentDict()
