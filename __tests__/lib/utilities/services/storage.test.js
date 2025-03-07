import { StorageOperations } from '@lib/utilities/services/storage';

describe('StorageOperations', () => {
  // Mock localStorage before each test
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {
      store: {},
      getItem: jest.fn((key) => localStorageMock.store[key] || null),
      setItem: jest.fn((key, value) => {
        localStorageMock.store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete localStorageMock.store[key];
      }),
      clear: jest.fn(() => {
        localStorageMock.store = {};
      })
    };

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  describe('project path operations', () => {
    test('saveProjectPath saves path to localStorage', () => {
      const testPath = '/test/project/path';
      StorageOperations.saveProjectPath(testPath);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('projectFolder', testPath);
    });

    test('saveProjectPath throws error if path is falsy', () => {
      expect(() => StorageOperations.saveProjectPath(null)).toThrow('Project path is required');
      expect(() => StorageOperations.saveProjectPath('')).toThrow('Project path is required');
    });

    test('getProjectPath returns saved path', () => {
      localStorageMock.store.projectFolder = '/test/project/path';

      const result = StorageOperations.getProjectPath();
      expect(result).toBe('/test/project/path');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('projectFolder');
    });
  });

  describe('full project data operations', () => {
    const testProjectData = {
      projectPath: '/test/project',
      contentPath: '/test/project/content',
      dataPath: '/test/project/data'
    };

    test('saveProjectData saves all paths', () => {
      StorageOperations.saveProjectData(testProjectData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'projectFolder',
        testProjectData.projectPath
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'contentFolder',
        testProjectData.contentPath
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('dataFolder', testProjectData.dataPath);
    });

    test('getProjectData returns null if project not set', () => {
      const result = StorageOperations.getProjectData();
      expect(result).toBeNull();
    });

    test('getProjectData returns all project data', () => {
      localStorageMock.store = {
        projectFolder: testProjectData.projectPath,
        contentFolder: testProjectData.contentPath,
        dataFolder: testProjectData.dataPath
      };

      const result = StorageOperations.getProjectData();
      expect(result).toEqual(testProjectData);
    });

    test('clearProjectData removes all project data', () => {
      localStorageMock.store = {
        projectFolder: testProjectData.projectPath,
        contentFolder: testProjectData.contentPath,
        dataFolder: testProjectData.dataPath,
        otherKey: 'should remain'
      };

      StorageOperations.clearProjectData();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3);
      expect(localStorageMock.store.projectFolder).toBeUndefined();
      expect(localStorageMock.store.contentFolder).toBeUndefined();
      expect(localStorageMock.store.dataPath).toBeUndefined();
      expect(localStorageMock.store.otherKey).toBe('should remain');
    });
  });

  describe('recent projects management', () => {
    const testProject1 = {
      projectPath: '/test/project1',
      contentPath: '/test/project1/content',
      dataPath: '/test/project1/data'
    };

    const testProject2 = {
      projectPath: '/test/project2',
      contentPath: '/test/project2/content',
      dataPath: '/test/project2/data'
    };

    test('getRecentProjects returns empty array when no projects exist', () => {
      const result = StorageOperations.getRecentProjects();
      expect(result).toEqual([]);
    });

    test('getRecentProjects returns parsed projects', () => {
      localStorageMock.store.recentProjects = JSON.stringify([testProject1, testProject2]);

      const result = StorageOperations.getRecentProjects();
      expect(result).toEqual([testProject1, testProject2]);
    });

    test('addToRecentProjects adds project to beginning of list', () => {
      localStorageMock.store.recentProjects = JSON.stringify([testProject1]);

      StorageOperations.addToRecentProjects(testProject2);

      const result = JSON.parse(localStorageMock.store.recentProjects);
      expect(result[0]).toEqual(testProject2);
      expect(result[1]).toEqual(testProject1);
    });

    test('addToRecentProjects moves existing project to beginning of list', () => {
      localStorageMock.store.recentProjects = JSON.stringify([testProject1, testProject2]);

      StorageOperations.addToRecentProjects(testProject2);

      const result = JSON.parse(localStorageMock.store.recentProjects);
      expect(result[0]).toEqual(testProject2);
      expect(result[1]).toEqual(testProject1);
      expect(result.length).toBe(2);
    });

    test('removeFromRecentProjects removes project from list', () => {
      localStorageMock.store.recentProjects = JSON.stringify([testProject1, testProject2]);

      StorageOperations.removeFromRecentProjects(testProject1.projectPath);

      const result = JSON.parse(localStorageMock.store.recentProjects);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(testProject2);
    });
  });
});
